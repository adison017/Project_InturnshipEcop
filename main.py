import eel
import os
import subprocess
import sys
import urllib.request
import platform

# Check OS
IS_WINDOWS = os.name == 'nt'
IS_LINUX = sys.platform.startswith('linux')

if IS_WINDOWS:
    import ctypes

# Configuration
VM_NAME = "Wazuh-Server-Monitor"
OVA_FILE = "Wazuh-Install-Ready.ova"
VBOX_PATH_WIN = r"C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"
VBOX_INSTALLER_URL = "https://download.virtualbox.org/virtualbox/7.2.4/VirtualBox-7.2.4-170995-Win.exe"
VBOX_INSTALLER_NAME = "VirtualBox-Setup.exe"

# Credentials
VM_USER = "adison"
VM_PASS = "132547"
WAZUH_USER = "admin"
WAZUH_PASS = "admin"

# Initialize Eel
eel.init('web')

def get_virtualbox_path():
    if IS_WINDOWS:
        return VBOX_PATH_WIN
    else:
        # Linux default path usually just 'VBoxManage' if in PATH
        return "VBoxManage"

def is_admin():
    try:
        if IS_WINDOWS:
            return ctypes.windll.shell32.IsUserAnAdmin()
        else:
            return os.geteuid() == 0
    except:
        return False

@eel.expose
def get_os_info():
    """Detects and returns User's OS"""
    if IS_WINDOWS:
        return {"os": "Windows", "detail": platform.release()}
    elif IS_LINUX:
        try:
            # Try to get distribution info
            try:
                import distro
                dist_name = distro.name()  # e.g., Ubuntu, CentOS Linux
            except ImportError:
                # Fallback if distro module is not installed, parse /etc/os-release manually
                dist_name = "Linux"
                if os.path.exists("/etc/os-release"):
                    with open("/etc/os-release") as f:
                        for line in f:
                            if line.startswith("NAME="):
                                dist_name = line.split("=")[1].strip().strip('"')
                                break
            return {"os": dist_name, "detail": platform.release()}
        except:
            return {"os": "Linux", "detail": "Unknown"}
    else:
        return {"os": platform.system(), "detail": "Unknown"}

@eel.expose
def check_system():
    vbox_cmd = get_virtualbox_path()
    
    # Check if VBoxManage is callable
    try:
        # On Linux, VBoxManage might be in path, on Windows check specifically
        if IS_WINDOWS:
            if os.path.exists(vbox_cmd):
                return {"status": "success", "msg": "พบ VirtualBox แล้ว พร้อมใช้งาน!"}
            return {"status": "error", "msg": "ไม่พบ VirtualBox! กรุณาติดตั้งก่อน"}
        else:
            subprocess.run([vbox_cmd, "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            return {"status": "success", "msg": "พบ VirtualBox แล้ว พร้อมใช้งาน!"}
    except (subprocess.CalledProcessError, FileNotFoundError):
        return {"status": "error", "msg": "ไม่พบ VirtualBox! กรุณาติดตั้งก่อน"}

@eel.expose
def install_virtualbox(manual_os_name=None):
    # Detect OS automatically if not provided or to confirm
    os_info = get_os_info()
    detected_os = os_info['os']
    print(f"Installing for OS: {detected_os}")

    if IS_WINDOWS:
        return install_vbox_windows()
    elif "Ubuntu" in detected_os or "Debian" in detected_os:
        return install_vbox_linux_debian()
    elif any(x in detected_os for x in ["CentOS", "Red Hat", "Rocky", "Amazon", "Fedora"]):
        return install_vbox_linux_rhel()
    else:
        return {"status": "error", "msg": f"ไม่รองรับการติดตั้งอัตโนมัติสำหรับ {detected_os} กรุณาติดตั้ง VirtualBox ด้วยตนเอง"}

def install_vbox_windows():
    installer_path = os.path.abspath(VBOX_INSTALLER_NAME)
    if not os.path.exists(installer_path):
        try:
            print("Downloading VirtualBox for Windows...")
            urllib.request.urlretrieve(VBOX_INSTALLER_URL, installer_path)
        except Exception as e:
            return {"status": "error", "msg": f"โหลดไฟล์ไม่สำเร็จ: {str(e)}"}

    try:
        if is_admin():
            cmd = [installer_path, "--silent", "--ignore-reboot"]
            subprocess.run(cmd, check=True)
        else:
            ps_cmd = f"Start-Process -FilePath '{installer_path}' -ArgumentList '--silent', '--ignore-reboot' -Verb RunAs -Wait"
            subprocess.run(["powershell", "-Command", ps_cmd], check=True)
        return {"status": "success", "msg": "ติดตั้ง VirtualBox เสร็จแล้ว!"}
    except Exception as e:
        return {"status": "error", "msg": f"ติดตั้งไม่สำเร็จ: {str(e)}"}

def install_vbox_linux_debian():
    # Ubuntu/Debian logic
    try:
        # Requires sudo/pkexec. Eel running as normal user might fail.
        # We can try using pkexec to get a GUI password prompt if generic sudo fails.
        cmd = "sudo apt-get update && sudo apt-get install -y virtualbox"
        
        # Open a terminal to run this? Or assume sudo rights?
        # For a GUI app, launching a terminal is safer so user can type password.
        subprocess.run(["x-terminal-emulator", "-e", "bash -c 'sudo apt-get update && sudo apt-get install -y virtualbox; read -p \"Press Enter to close\"'"], check=True)
        return {"status": "success", "msg": "สั่งติดตั้งผ่าน Terminal แล้ว กรุณาตรวจสอบ"}
    except Exception as e:
        return {"status": "error", "msg": f"ติดตั้งผิดพลาด (ลองรัน sudo apt install virtualbox): {e}"}

def install_vbox_linux_rhel():
    # CentOS/Rocky/Amazon
    try:
        # Example for RHEL-likes
        cmd = "sudo yum install -y virtualbox" # Or dnf
        subprocess.run(["x-terminal-emulator", "-e", "bash -c 'sudo yum install -y virtualbox; read -p \"Press Enter to close\"'"], check=True)
        return {"status": "success", "msg": "สั่งติดตั้งผ่าน Terminal แล้ว กรุณาตรวจสอบ"}
    except Exception as e:
        return {"status": "error", "msg": f"ติดตั้งผิดพลาด (ลองรัน sudo yum install virtualbox): {e}"}

@eel.expose
def install_vm():
    if not os.path.exists(OVA_FILE):
        return {"status": "error", "msg": f"หาไฟล์ {OVA_FILE} ไม่เจอ!"}
    
    vbox = get_virtualbox_path()
    try:
        cmd = [vbox, "import", OVA_FILE, "--vsys", "0", "--vmname", VM_NAME]
        subprocess.run(cmd, check=True) # remove creationflags for cross-platform compat or handle conditionally
        return {"status": "success", "msg": "ติดตั้ง Wazuh เรียบร้อยแล้ว!"}
    except Exception as e:
        return {"status": "error", "msg": f"เกิดข้อผิดพลาด: {str(e)}"}

@eel.expose
def start_vm():
    vbox = get_virtualbox_path()
    try:
        cmd = [vbox, "startvm", VM_NAME, "--type", "gui"]
        subprocess.run(cmd, check=True)
        return {"status": "success", "msg": "กำลังเปิดเครื่อง Wazuh..."}
    except Exception as e:
        return {"status": "error", "msg": "เปิดเครื่องไม่สำเร็จ (อาจเปิดอยู่แล้ว)"}

@eel.expose
def stop_vm():
    vbox = get_virtualbox_path()
    try:
        cmd = [vbox, "controlvm", VM_NAME, "acpipowerbutton"]
        subprocess.run(cmd, check=True)
        return {"status": "success", "msg": "สั่งปิดเครื่องแล้ว"}
    except:
        return {"status": "error", "msg": "สั่งปิดไม่ได้"}

@eel.expose
def get_wazuh_ip():
    try:
        vbox = get_virtualbox_path()
        # คำสั่งถาม IP จาก Guest Utilities ใน VM
        # /VirtualBox/GuestInfo/Net/0/V4/IP คือ Key มาตรฐานสำหรับ IP Address แรก
        cmd = [vbox, "guestproperty", "get", VM_NAME, "/VirtualBox/GuestInfo/Net/0/V4/IP"]
        
        # รันคำสั่งแบบซ่อนหน้าต่าง
        if IS_WINDOWS:
            result = subprocess.run(cmd, capture_output=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW)
        else:
            result = subprocess.run(cmd, capture_output=True, text=True)
            
        output = result.stdout.strip()

        # ผลลัพธ์ที่ได้จะเป็น format: "Value: 192.168.1.xxx" หรือ "No value set!"
        if "Value:" in output:
            # ตัดเอาเฉพาะตัวเลข IP
            ip_address = output.split("Value:")[1].strip()
            return {"status": "success", "ip": ip_address}
        else:
            return {"status": "pending", "msg": "กำลังรอ IP..."}
            
    except Exception as e:
        return {"status": "error", "msg": str(e)}

@eel.expose
def check_vm_running():
    vbox = get_virtualbox_path()
    try:
        if IS_WINDOWS:
            result = subprocess.run([vbox, "list", "runningvms"], capture_output=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW)
        else:
            result = subprocess.run([vbox, "list", "runningvms"], capture_output=True, text=True)
            
        if VM_NAME in result.stdout:
            return True
        return False
    except:
        return False

@eel.expose
def check_vm_logged_in():
    """ตรวจสอบว่ามีการล็อกอินใน VM แล้วหรือยัง"""
    vbox = get_virtualbox_path()
    try:
        # 1. Check LoggedInUsers (Count)
        cmd_count = [vbox, "guestproperty", "get", VM_NAME, "/VirtualBox/GuestInfo/OS/LoggedInUsers"]
        
        # Helper to run command
        def run_vbox_cmd(c):
            if IS_WINDOWS:
                return subprocess.run(c, capture_output=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW)
            else:
                return subprocess.run(c, capture_output=True, text=True)

        res_count = run_vbox_cmd(cmd_count).stdout.strip()
        if "Value:" in res_count:
            try:
                if int(res_count.split("Value:")[1].strip()) > 0:
                    return True
            except:
                pass
        
        # 2. Check LoggedInUsersList (Names) - Fallback
        cmd_list = [vbox, "guestproperty", "get", VM_NAME, "/VirtualBox/GuestInfo/OS/LoggedInUsersList"]
        res_list = run_vbox_cmd(cmd_list).stdout.strip()
        if "Value:" in res_list:
            user_list = res_list.split("Value:")[1].strip()
            if user_list: # If string is not empty
                return True

        return False
    except Exception as e:
        print(f"Login check error: {e}")
        return False

@eel.expose
def check_vm_exists():
    """ตรวจสอบว่า VM มีอยู่แล้วหรือยัง"""
    vbox = get_virtualbox_path()
    try:
        if IS_WINDOWS:
            result = subprocess.run([vbox, "list", "vms"], capture_output=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW)
        else:
            result = subprocess.run([vbox, "list", "vms"], capture_output=True, text=True)
        
        if VM_NAME in result.stdout:
            return {"exists": True}
        return {"exists": False}
    except Exception as e:
        return {"exists": False, "error": str(e)}

@eel.expose
def check_ova_exists():
    """ตรวจสอบว่าไฟล์ OVA มีอยู่หรือยัง"""
    return {"exists": os.path.exists(OVA_FILE)}

@eel.expose
def get_credentials():
    """คืนค่า credentials สำหรับ VM และ Wazuh Dashboard"""
    return {
        "vm": {"user": VM_USER, "pass": VM_PASS},
        "wazuh": {"user": WAZUH_USER, "pass": WAZUH_PASS}
    }

@eel.expose
def reset_window_size():
    """Resets the window size and centers it (Windows only)"""
    if IS_WINDOWS:
        try:
            # Re-calculate center
            user32 = ctypes.windll.user32
            screen_width = user32.GetSystemMetrics(0)
            screen_height = user32.GetSystemMetrics(1)
            
            window_width = 900
            window_height = 610
            
            center_x = int((screen_width - window_width) / 2)
            center_y = int((screen_height - window_height) / 2)

            # Retry looking for window
            hwnd = None
            for i in range(10): # Try for a bit if called early
                hwnd = ctypes.windll.user32.FindWindowW(None, "Wazuh Launcher")
                if hwnd:
                    break
                time.sleep(0.1)
                
            if hwnd:
                # Constants
                GWL_STYLE = -16
                WS_MAXIMIZEBOX = 0x00010000
                WS_THICKFRAME = 0x00040000 
                
                # Apply style
                style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_STYLE)
                style = style & ~WS_MAXIMIZEBOX # Disable Maximize
                style = style & ~WS_THICKFRAME  # Disable Resize Sizing Border
                
                ctypes.windll.user32.SetWindowLongW(hwnd, GWL_STYLE, style)
                
                # Force refresh window to apply styles AND FORCE POSITION/SIZE
                ctypes.windll.user32.SetWindowPos(hwnd, 0, center_x, center_y, window_width, window_height, 0x0064)
        except Exception as e:
            print(f"Error resetting window: {e}")

if __name__ == '__main__':
    # Remove manual DPI awareness to ensure coordinates match EEL/Chrome expectations (Logical Pixels)
    if IS_WINDOWS:
        user32 = ctypes.windll.user32
        screen_width = user32.GetSystemMetrics(0)
        screen_height = user32.GetSystemMetrics(1)
    else:
        # Default fallback for Linux
        screen_width = 1920
        screen_height = 1080

    # 1. Configuration: Fixed Size (Reduced size)
    window_width = 900
    window_height = 610
    
    # 2. Function: Center Window
    center_x = int((screen_width - window_width) / 2)
    center_y = int((screen_height - window_height) / 2)
    
    print(f"Starting generic app window at {window_width}x{window_height} position ({center_x},{center_y})")
    
    # Start Eel (non-blocking)
    eel.start('index.html', size=(window_width, window_height), position=(center_x, center_y), block=False)
    
    # 3. Technical: Remove Maximize/Resize on Windows
    if IS_WINDOWS:
        import time
        import threading
        
        # Run in thread to not delay main loop entry
        threading.Thread(target=reset_window_size, daemon=True).start()

    # Main Loop
    while True:
        eel.sleep(1.0)