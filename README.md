# 📱 Escáner de Código QR a Google Sheets

Página web responsiva para escanear códigos QR utilizando la cámara del dispositivo, copiar el texto detectado al portapapeles y registrar automáticamente la información en una hoja de cálculo de Google Sheets.

## 🚀 Demo
Puedes probar la aplicación en vivo desde el siguiente enlace:
> *https://eoct-234.github.io/lector_QR/*

## 🛠️ Tecnologías Utilizadas
* **HTML5**: Estructura semántica del sitio.
* **CSS3**: Diseño moderno, limpio y adaptable a celulares.
* **JavaScript (Vanilla)**: Lógica modular para manejo de eventos.
* **[html5-qrcode](https://github.com/mebjas/html5-qrcode)**: Librería para el escaneo de códigos QR mediante la cámara.
* **Google Apps Script**: Backend serverless (API / Webhook) para conectar la app con Google Sheets.

## 📂 Estructura del Proyecto

```text
mi-proyecto-web/
├── index.html        # Interfaz de usuario (Estructura HTML)
├── style.css         # Estilos y diseño visual (CSS)
├── README.md         # Documentación del proyecto
└── js/
    ├── main.js       # Coordinador principal de la app
    ├── qrScanner.js  # Lógica del lector de código QR
    └── sheets.js     # Envío de datos a Google Sheets