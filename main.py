import eel
import os
import subprocess
import ctypes
import sys

import urllib.request

# ตั้งค่า Config
VM_NAME = "Wazuh-Server-Monitor"
OVA_FILE = "Wazuh-Install-Ready.ova"
VBOX_PATH = r"C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"
VBOX_INSTALLER_URL = "https://download.virtualbox.org/virtualbox/7.2.4/VirtualBox-7.2.4-170995-Win.exe"
VBOX_INSTALLER_NAME = "VirtualBox-Setup.exe"

# เริ่มต้น Eel (ชี้ไปที่โฟลเดอร์ web)
eel.init('web')

# ฟังก์ชันตรวจสอบสิทธิ์ Admin (เพื่อความชัวร์)
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

# --- ฟังก์ชันที่จะให้ JavaScript เรียกใช้ ---

@eel.expose
def check_system():
    if os.path.exists(VBOX_PATH):
        return {"status": "success", "msg": "พบ VirtualBox แล้ว พร้อมใช้งาน!"}
    else:
        return {"status": "error", "msg": "ไม่พบ VirtualBox! กรุณาติดตั้งก่อน"}

@eel.expose
def install_virtualbox(operating_system):
    print(f"User Operating System: {operating_system}")
    # 1. ตรวจสอบว่ามีไฟล์ติดตั้งหรือยัง
    installer_path = os.path.abspath(VBOX_INSTALLER_NAME)
    if not os.path.exists(installer_path):
        try:
            print("Downloading VirtualBox...")
            urllib.request.urlretrieve(VBOX_INSTALLER_URL, installer_path)
        except Exception as e:
            return {"status": "error", "msg": f"โหลดไฟล์ไม่สำเร็จ: {str(e)}"}

    # 2. สั่งติดตั้ง (รองรับ UAC/Admin)
    try:
        if is_admin():
            # ถ้าเป็น Admin อยู่แล้ว รันตรงๆ ได้เลย
            cmd = [installer_path, "--silent", "--ignore-reboot"]
            subprocess.run(cmd, check=True)
        else:
            # ถ้าไม่ใช่ Admin ให้ใช้ PowerShell เรียก runas (จะมี Pop-up เด้งถาม)
            # -Verb RunAs: ขอสิทธิ์ Admin
            # -Wait: รอจนกว่าจะติดตั้งเสร็จ
            ps_cmd = f"Start-Process -FilePath '{installer_path}' -ArgumentList '--silent', '--ignore-reboot' -Verb RunAs -Wait"
            subprocess.run(["powershell", "-Command", ps_cmd], check=True)
            
        return {"status": "success", "msg": "ติดตั้ง VirtualBox เสร็จแล้ว!"}
    except Exception as e:
        return {"status": "error", "msg": f"ติดตั้งไม่สำเร็จ: {str(e)}"}

@eel.expose
def install_vm():
    if not os.path.exists(OVA_FILE):
        return {"status": "error", "msg": f"หาไฟล์ {OVA_FILE} ไม่เจอ!"}
    
    try:
        # สั่ง Import OVA
        cmd = [VBOX_PATH, "import", OVA_FILE, "--vsys", "0", "--vmname", VM_NAME]
        subprocess.run(cmd, check=True, creationflags=subprocess.CREATE_NO_WINDOW)
        return {"status": "success", "msg": "ติดตั้ง Wazuh เรียบร้อยแล้ว!"}
    except Exception as e:
        return {"status": "error", "msg": f"เกิดข้อผิดพลาด: {str(e)}"}

@eel.expose
def start_vm():
    try:
        cmd = [VBOX_PATH, "startvm", VM_NAME, "--type", "gui"]
        subprocess.run(cmd, check=True, creationflags=subprocess.CREATE_NO_WINDOW)
        return {"status": "success", "msg": "กำลังเปิดเครื่อง Wazuh..."}
    except Exception as e:
        return {"status": "error", "msg": "เปิดเครื่องไม่สำเร็จ (อาจเปิดอยู่แล้ว)"}

@eel.expose
def stop_vm():
    try:
        cmd = [VBOX_PATH, "controlvm", VM_NAME, "acpipowerbutton"]
        subprocess.run(cmd, check=True, creationflags=subprocess.CREATE_NO_WINDOW)
        return {"status": "success", "msg": "สั่งปิดเครื่องแล้ว"}
    except:
        return {"status": "error", "msg": "สั่งปิดไม่ได้"}

# เริ่มรันโปรแกรม (เปิดหน้าต่างขนาด 500x600)
if __name__ == '__main__':
    eel.start('index.html', size=(500, 650))