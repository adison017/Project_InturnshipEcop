# ระบบตรวจสอบและติดตั้ง Wazuh Server (Wazuh Server Monitor & Installer)

โปรเจคนี้เป็นโปรแกรมที่มีหน้าจอกราฟิก (GUI) ออกแบบมาเพื่อช่วยให้การติดตั้งและจัดการ **Wazuh Server** (บน Virtual Machine) เป็นเรื่องง่าย ผู้ใช้งานสามารถสั่งติดตั้ง VirtualBox, นำเข้าไฟล์ Wazuh OVA ที่ตั้งค่ามาแล้ว, และตรวจสอบสถานะของ VM (เช่น IP Address) เพื่อเข้าใช้งาน Wazuh Dashboard ได้ทันที

## 🚀 เทคโนโลยีที่ใช้

*   **Backend (ส่วนหลังบ้าน)**: Python
    *   **[Eel](https://github.com/python-eel/Eel)**: ใช้สำหรับสร้างเว็บเซิร์ฟเวอร์แบบ Local และเชื่อมต่อระหว่าง Python กับ Frontend (JavaScript)
    *   **Subprocess**: ใช้สำหรับสั่งรันคำสั่ง System ต่างๆ (เช่น คำสั่งจัดการ VirtualBox)
*   **Frontend (ส่วนหน้าจอ)**: HTML5, JavaScript (ES6 Modules)
    *   **Tailwind CSS**: ใช้สำหรับตกแต่งหน้าจอให้สวยงามและรองรับหลายขนาดหน้าจอ (ผ่าน CDN)
*   **Virtualization (ระบบจำลองเครื่อง)**:
    *   **VirtualBox**: โปรแกรมจำลองเครื่องคอมพิวเตอร์ (Hypervisor) สำหรับรัน Wazuh Server
    *   **Wazuh**: แพลตฟอร์มด้านความปลอดภัย (SIEM) แบบ Open Source ที่รันอยู่ใน VM

## 📂 โครงสร้างโปรเจค

- **`main.py`**: ไฟล์หลักของโปรแกรม ทำหน้าที่ตรวจสอบระบบปฏิบัติการ (OS), จัดการ VirtualBox (ติดตั้ง/เปิด/ปิด), และสร้าง API ให้ Frontend เรียกใช้
- **`web/`**: โฟลเดอร์เก็บไฟล์หน้าจอผู้ใช้งาน (UI)
    - **`index.html`**: ไฟล์หน้าหลักของโปรแกรม
    - **`js/main.js`**: ไฟล์จัดการการทำงานหลักของ Frontend
    - **`js/components/`**: ส่วนประกอบย่อยของหน้าจอ (Components) เช่น ตัวนำทาง (StepWizard), หน้าจอ Terminal
        - `StepWizard.js`: ควบคุมขั้นตอนการติดตั้ง (ติดตั้ง VBox -> นำเข้า VM -> แสดงรหัสผ่าน -> เปิด Dashboard)
    - **`css/`**: ไฟล์ตกแต่งเพิ่มเติม (นอกเหนือจาก Tailwind)
- **`Wazuh-Install-Ready.ova`**: (จำเป็นต้องมี) ไฟล์ Image ของ Virtual Machine ที่ติดตั้ง Wazuh ไว้พร้อมใช้งานแล้ว (ต้องวางไว้ที่โฟลเดอร์เดียวกับ `main.py`)

## ✨ คุณสมบัติหลัก

1.  **ตรวจสอบระบบอัตโนมัติ**: ตรวจสอบว่าเครื่องผู้ใช้เป็น Windows หรือ Linux และตรวจสอบว่าติดตั้ง VirtualBox หรือยัง
2.  **ช่วยติดตั้งโปรแกรม**:
    *   ดาวน์โหลดและติดตั้ง VirtualBox ให้เองอัตโนมัติ (สำหรับ Windows)
    *   แนะนำคำสั่งติดตั้งผ่าน Terminal (สำหรับ Linux)
3.  **ติดตั้ง Wazuh ง่ายๆ**: นำเข้าไฟล์ Wazuh Server OVA (`Wazuh-Install-Ready.ova`) เข้า VirtualBox ได้ในคลิกเดียว
4.  **จัดการ VM**:
    *   **เปิด/ปิด เครื่อง**: สั่งเริ่มหรือหยุดการทำงานของ Wazuh Server ได้จากหน้าจอโปรแกรม
    *   **ดูสถานะ**: แสดงสถานะการทำงานของเครื่องแบบ Real-time
5.  **เข้าถึง Dashboard สะดวก**:
    *   ระบบค้นหา IP Address ของ VM ให้อัตโนมัติ ไม่ต้องไปเปิดดูเอง
    *   แสดงรหัสผ่านสำหรับ Login เข้า Ubuntu และ Wazuh Dashboard
    *   มีปุ่มกดเพื่อเปิดหน้าเว็บ Dashboard ได้ทันทีเมื่อพร้อมใช้งาน

## ⚙️ หลักการทำงาน (System Workflow)

ระบบทำงานโดยการเชื่อมระหว่าง **Python (Backend)** และ **JavaScript (Frontend)** ผ่าน Library ที่ชื่อว่า **Eel** โดยมีขั้นตอนการทำงานเบื้องหลังดังนี้:

1.  **การเริ่มต้น (Initialization)**:
    *   เมื่อสั่งรัน `main.py` โปรแกรมจะเริ่ม Local Web Server และเปิดหน้าต่าง UI (Chrome/Edge Engine)
    *   ระบบตรวจสอบ OS และตรวจสอบ path ของโปรแกรม `VBoxManage` เพื่อเตรียมพร้อมสั่งงาน

2.  **การตรวจสอบและติดตั้ง (Check & Install)**:
    *   Frontend เรียกฟังก์ชัน Python เพื่อเช็คการติดตั้ง VirtualBox
    *   หากยังไม่มี: โปรแกรมจะดาวน์โหลดตัวติดตั้ง (ไฟล์ `.exe` สำหรับ Windows) และรันคำสั่งติดตั้งแบบ Silent Mode
    *   หากมีแล้ว: จะตรวจสอบไฟล์ OVA และใช้คำสั่ง `VBoxManage import` เพื่อนำเข้า VM เข้าสู่ระบบ

3.  **การควบคุมและติดตาม (Control & Monitor)**:
    *   **การเปิด/ปิด**: ใช้ `subprocess` ใน Python ยิงคำสั่ง `VBoxManage startvm` หรือ `controlvm` ไปที่ตัว VirtualBox
    *   **การหา IP Address**: โปรแกรมไม่ได้สแกน Network แต่ใช้วิธีอ่านค่า **Guest Properties** ของ VirtualBox
        *   คำสั่ง: `VBoxManage guestproperty get "VM_Name" "/VirtualBox/GuestInfo/Net/0/V4/IP"`
        *   วิธีนี้แม่นยำและรวดเร็วกว่าการสแกน IP ทั่วไป แต่ VM จำเป็นต้องรัน VirtualBox Guest Additions

## 🛠️ การติดตั้งและใช้งาน

### สิ่งที่ต้องมีเบื้องต้น (Prerequisites)
*   **Python**: เวอร์ชั่น 3.7 ขึ้นไป
*   **Wazuh OVA File**: ไฟล์ `Wazuh-Install-Ready.ova` (ต้องวางไว้ในโฟลเดอร์โปรเจค)

### การเริ่มใข้งาน

1.  ติดตั้ง Library ของ Python ที่จำเป็น:
    ```bash
    pip install eel distro
    ```

2.  ตรวจสอบไฟล์ OVA:
    *   ตรวจสอบให้แน่ใจว่ามีไฟล์ `Wazuh-Install-Ready.ova` วางอยู่คู่กับไฟล์ `main.py`

3.  รันโปรแกรม:
    พิมพ์คำสั่งต่อไปนี้ใน Terminal หรือ CMD:

    ```bash
    python main.py
    ```

    หน้าต่างโปรแกรมจะเปิดขึ้นมา และแนะนำขั้นตอนการติดตั้งทีละขั้นตอน

## 📝 การตั้งค่าเพิ่มเติม

*   **รหัสผ่าน VM**: รหัสผ่านเริ่มต้นถูกตั้งค่าไว้ในไฟล์ `main.py` (ตัวแปร `VM_USER`, `VM_PASS`)
*   **เวอร์ชั่น**: ข้อมูลเวอร์ชั่นของ Ubuntu และ Wazuh ที่แสดงบนหน้าจอ สามารถแก้ไขได้ในไฟล์ `main.py`
