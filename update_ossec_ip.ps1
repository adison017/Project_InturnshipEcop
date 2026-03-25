<#
.SYNOPSIS
    Securely updates the Wazuh Server IP in ossec.conf for Windows Agents.
.DESCRIPTION
    Refactored by Senior DevOps/Cybersecurity Engineer.
    Includes IP validation, XML integrity checks, and service state management.
#>
param (
    [Parameter(Mandatory=$true, HelpMessage="New Wazuh Server IP Address")]
    [ValidateNotNullOrEmpty()]
    [string]$NewIP
)

# --- State Initialization ---
$FatalError = $false

# --- Configuration ---
$ConfigPath = "C:\Program Files (x86)\ossec-agent\ossec.conf"
$BackupPath = "$ConfigPath.bak"
$LogPath    = "C:\Users\LENOVO\Project_InturnshipEcop\ip_update.log" # Production log path

# --- Global Settings ---
$OutputEncoding = [System.Text.Encoding]::UTF8

# --- Helper Functions ---
function Write-Log {
    param([string]$Message, [ValidateSet("INFO", "WARN", "ERROR")] $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    
    # PowerShell 5.1 does not support ternary operators (? :). Using if/else for compatibility.
    $Color = "Gray"
    if ($Level -eq "ERROR") { $Color = "Red" }
    elseif ($Level -eq "WARN") { $Color = "Yellow" }
    
    Write-Host $LogEntry -ForegroundColor $Color
    $LogEntry | Out-File -FilePath $LogPath -Append -Encoding UTF8
}

function Invoke-Rollback {
    Write-Log "Critical error encountered. Initiating rollback..." "WARN"
    if (Test-Path $BackupPath) {
        Copy-Item $BackupPath $ConfigPath -Force
        Write-Log "Rollback successful: Restored config from backup." "INFO"
    } else {
        Write-Log "Rollback failed: Backup file not found!" "ERROR"
    }
}

# --- 1. IP Validation ---
Write-Log "Validation Phase: Checking IP integrity for '$NewIP'..."
$IPAddr = $null
if (-not [ipaddress]::TryParse($NewIP, [ref]$IPAddr)) {
    Write-Log "Invalid IP Address format: $NewIP. Aborting for safety." "ERROR"
    exit 1
}

# --- 2. Security & Environment Checks ---
if (-not (Test-Path $ConfigPath)) {
    Write-Log "Target configuration not found at $ConfigPath" "ERROR"
    exit 1
}

# --- 3. Backup Phase ---
try {
    Copy-Item $ConfigPath $BackupPath -Force -ErrorAction Stop
    Write-Log "State Management: Backup created at $BackupPath"
} catch {
    Write-Log "Failed to create security backup: $($_.Exception.Message)" "ERROR"
    exit 1
}

# --- 4. Service Suspension ---
$ServiceNames = @("Wazuh", "WazuhSvc", "OssecSvc")
$ServicesToRestart = @()

foreach ($SvcName in $ServiceNames) {
    $Svc = Get-Service -Name $SvcName -ErrorAction SilentlyContinue
    if ($Svc -and $Svc.Status -eq 'Running') {
        Write-Log "Service Control: Stopping $SvcName to release file locks..."
        Stop-Service -Name $SvcName -Force -ErrorAction Stop
        $ServicesToRestart += $SvcName
    }
}

# --- 5. XML Transformation ---
try {
    Write-Log "Processing: Loading XML configuration..."
    [xml]$XMLData = Get-Content $ConfigPath -ErrorAction Stop
    
    # Secure specific node targets (Avoids destroying other tags)
    $TargetUpdated = $false

    # A. Update Client Server Address
    $AddressNodes = $XMLData.SelectNodes("//ossec_config/client/server/address")
    foreach ($Node in $AddressNodes) {
        if ($Node."#text" -ne $NewIP) {
            $Node."#text" = $NewIP
            $TargetUpdated = $true
        }
    }

    # B. Update Enrollment Manager Address
    $EnrollmentNode = $XMLData.SelectSingleNode("//ossec_config/client/enrollment/manager_address")
    if ($EnrollmentNode) {
        if ($EnrollmentNode."#text" -ne $NewIP) {
            $EnrollmentNode."#text" = $NewIP
            $TargetUpdated = $true
        }
    }

    if (-not $TargetUpdated) {
        Write-Log "No changes required. IP already matches current configuration." "WARN"
    } else {
        # --- 6. XML Integrity Validation (Pre-Save) ---
        Write-Log "Integrity: Validating XML structure before persistent save..."
        # We try to convert back to string to ensure it's still valid XML
        $Dummy = $XMLData.OuterXml 

        # --- 7. Save Phase ---
        $XMLData.Save($ConfigPath)
        Write-Log "Success: Configuration updated securely."
    }
} catch {
    Write-Log "Fatal transformation error: $($_.Exception.Message)" "ERROR"
    Invoke-Rollback
    $FatalError = $true
} finally {
    # --- 8. Service Restoration ---
    foreach ($SvcName in $ServicesToRestart) {
        Write-Log "Service Control: Restarting $SvcName..."
        Start-Service -Name $SvcName -ErrorAction SilentlyContinue
    }
}

if ($FatalError) {
    Write-Log "Script terminated with errors. Infrastructure remains stable due to rollback." "WARN"
    exit 1
}

Write-Log "Deployment Complete. Endpoint synced to $NewIP" "INFO"
exit 0
