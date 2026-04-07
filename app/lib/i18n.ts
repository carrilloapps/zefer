export type Locale = "es" | "en" | "pt";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "ES" },
  { code: "en", label: "English", flag: "EN" },
  { code: "pt", label: "Português", flag: "PT" },
];

const translations = {
  // ─── Navbar ───
  "nav.encrypted": {
    es: "CIFRADO E2E",
    en: "E2E ENCRYPTED",
    pt: "CRIPTOGRAFIA E2E",
  },
  "nav.project": {
    es: "Proyecto",
    en: "Project",
    pt: "Projeto",
  },
  "nav.donate": {
    es: "Donar",
    en: "Donate",
    pt: "Doar",
  },
  "nav.author": {
    es: "Sobre el autor",
    en: "About the author",
    pt: "Sobre o autor",
  },
  "nav.install": {
    es: "Instalar",
    en: "Install",
    pt: "Instalar",
  },
  "nav.privacy": {
    es: "Privacidad",
    en: "Privacy",
    pt: "Privacidade",
  },

  // ─── Legal banner ───
  "banner.title": {
    es: "Aviso legal y de privacidad",
    en: "Legal and privacy notice",
    pt: "Aviso legal e de privacidade",
  },
  "banner.desc": {
    es: "Zefer no utiliza cookies, rastreadores ni analíticas. Todo el cifrado ocurre en tu navegador. Ningún dato personal se recopila ni se transmite. Al continuar, aceptas nuestros términos de uso.",
    en: "Zefer does not use cookies, trackers, or analytics. All encryption happens in your browser. No personal data is collected or transmitted. By continuing, you accept our terms of use.",
    pt: "O Zefer não utiliza cookies, rastreadores nem analíticas. Toda a criptografia acontece no seu navegador. Nenhum dado pessoal é coletado ou transmitido. Ao continuar, você aceita nossos termos de uso.",
  },
  "banner.accept": {
    es: "Entendido",
    en: "Got it",
    pt: "Entendi",
  },

  // ─── Hero ───
  "hero.badge": {
    es: "CIFRADO ZERO-KNOWLEDGE",
    en: "ZERO-KNOWLEDGE ENCRYPTION",
    pt: "CRIPTOGRAFIA ZERO-KNOWLEDGE",
  },
  "hero.title": {
    es: "Comparte secretos,",
    en: "Share secrets,",
    pt: "Compartilhe segredos,",
  },
  "hero.title.highlight": {
    es: "sin riesgos",
    en: "not risks",
    pt: "sem riscos",
  },
  "hero.subtitle": {
    es: "Cifra contraseñas, claves de API y datos sensibles en archivos .zefer protegidos con contraseña. Sin servidores, sin rastros.",
    en: "Encrypt passwords, API keys, and sensitive data into password-protected .zefer files. No servers, no traces.",
    pt: "Criptografe senhas, chaves de API e dados sensíveis em arquivos .zefer protegidos por senha. Sem servidores, sem rastros.",
  },

  // ─── Tabs ───
  "tab.encrypt": {
    es: "Cifrar",
    en: "Encrypt",
    pt: "Criptografar",
  },
  "tab.decrypt": {
    es: "Descifrar",
    en: "Decrypt",
    pt: "Descriptografar",
  },

  // ─── Steps ───
  "steps.title": {
    es: "¿Cómo funciona?",
    en: "How it works",
    pt: "Como funciona",
  },
  "steps.1.title": {
    es: "Cifra y descarga",
    en: "Encrypt & Download",
    pt: "Criptografe e baixe",
  },
  "steps.2.title": {
    es: "Envía el archivo",
    en: "Send the file",
    pt: "Envie o arquivo",
  },
  "steps.3.title": {
    es: "Descifra y visualiza",
    en: "Decrypt & View",
    pt: "Descriptografe e visualize",
  },

  // ─── Encrypt form ───
  "encrypt.title": {
    es: "Cifrar un secreto",
    en: "Encrypt a secret",
    pt: "Criptografar um segredo",
  },
  "encrypt.subtitle": {
    es: "Se generará un archivo .zefer cifrado",
    en: "A .zefer encrypted file will be generated",
    pt: "Um arquivo .zefer criptografado será gerado",
  },
  "encrypt.submit": {
    es: "Cifrar y descargar .zefer",
    en: "Encrypt & Download .zefer",
    pt: "Criptografar e baixar .zefer",
  },
  "encrypt.success.title": {
    es: "¡Archivo .zefer creado!",
    en: "Your .zefer file is ready!",
    pt: "Arquivo .zefer criado!",
  },
  "encrypt.success.subtitle": {
    es: "Tu archivo cifrado se ha descargado",
    en: "Your encrypted file has been downloaded",
    pt: "Seu arquivo criptografado foi baixado",
  },
  "encrypt.success.desc": {
    es: "Envía el archivo .zefer a tu destinatario por cualquier canal: correo electrónico, chat o SMS. Solo quien conozca la frase clave podrá descifrarlo.",
    en: "Send the .zefer file to your recipient through any channel: email, chat, or SMS. Only someone with the passphrase can decrypt it.",
    pt: "Envie o arquivo .zefer ao seu destinatário por qualquer canal: e-mail, chat ou SMS. Somente quem tiver a frase-chave poderá descriptografá-lo.",
  },
  "encrypt.another": {
    es: "Cifrar otro secreto",
    en: "Encrypt another secret",
    pt: "Criptografar outro segredo",
  },

  // ─── Decrypt form ───
  "decrypt.title": {
    es: "Descifrar un archivo .zefer",
    en: "Decrypt a .zefer file",
    pt: "Descriptografar um arquivo .zefer",
  },
  "decrypt.subtitle": {
    es: "Sube el archivo y proporciona la frase clave",
    en: "Upload the file and provide the passphrase",
    pt: "Envie o arquivo e insira a frase-chave",
  },
  "decrypt.file.label": {
    es: "Archivo .zefer",
    en: ".zefer file",
    pt: "Arquivo .zefer",
  },
  "decrypt.file.placeholder": {
    es: "Haz clic para seleccionar un archivo .zefer",
    en: "Click to select a .zefer file",
    pt: "Clique para selecionar um arquivo .zefer",
  },
  "decrypt.submit": {
    es: "Descifrar archivo",
    en: "Decrypt file",
    pt: "Descriptografar arquivo",
  },
  "decrypt.decrypting": {
    es: "Descifrando…",
    en: "Decrypting...",
    pt: "Descriptografando…",
  },
  "decrypt.note": {
    es: "El descifrado ocurre completamente en tu navegador. La frase clave y el contenido nunca se envían a ningún servidor.",
    en: "Decryption happens entirely in your browser. The passphrase and content are never sent to any server.",
    pt: "A descriptografia acontece inteiramente no seu navegador. A frase-chave e o conteúdo nunca são enviados a nenhum servidor.",
  },
  "decrypt.success.title": {
    es: "Secreto descifrado",
    en: "Secret decrypted",
    pt: "Segredo descriptografado",
  },
  "decrypt.copy": {
    es: "Copiar",
    en: "Copy",
    pt: "Copiar",
  },
  "decrypt.download": {
    es: "Descargar",
    en: "Download",
    pt: "Baixar",
  },
  "decrypt.expires": {
    es: "Expira",
    en: "Expires",
    pt: "Expira",
  },
  "decrypt.never": {
    es: "Sin expiración",
    en: "No expiration",
    pt: "Sem expiração",
  },
  "decrypt.another": {
    es: "Descifrar otro archivo",
    en: "Decrypt another file",
    pt: "Descriptografar outro arquivo",
  },
  "decrypt.tryother": {
    es: "Intentar con otro archivo",
    en: "Try another file",
    pt: "Tentar com outro arquivo",
  },
  "decrypt.expired.title": {
    es: "Archivo expirado",
    en: "File expired",
    pt: "Arquivo expirado",
  },
  "decrypt.expired.desc": {
    es: "Este archivo .zefer ha superado su fecha de expiración y ya no puede ser descifrado.",
    en: "This .zefer file has passed its expiration date and can no longer be decrypted.",
    pt: "Este arquivo .zefer ultrapassou sua data de expiração e não pode mais ser descriptografado.",
  },
  "decrypt.error.format": {
    es: "Formato de archivo no válido. Solo se aceptan archivos .zefer.",
    en: "Invalid file format. Only .zefer files are accepted.",
    pt: "Formato de arquivo inválido. Apenas arquivos .zefer são aceitos.",
  },
  "decrypt.error.nofile": {
    es: "Selecciona un archivo .zefer.",
    en: "Select a .zefer file.",
    pt: "Selecione um arquivo .zefer.",
  },
  "decrypt.error.nopass": {
    es: "Ingresa la frase clave.",
    en: "Enter the passphrase.",
    pt: "Insira a frase-chave.",
  },
  "decrypt.error.wrong": {
    es: "El descifrado falló. La frase clave puede ser incorrecta.",
    en: "Decryption failed. The passphrase may be incorrect.",
    pt: "A descriptografia falhou. A frase-chave pode estar incorreta.",
  },
  "decrypt.error.expired": {
    es: "Este archivo .zefer ha expirado.",
    en: "This .zefer file has expired.",
    pt: "Este arquivo .zefer expirou.",
  },

  // ─── Device ───
  "device.limit": {
    es: "Límite del dispositivo:",
    en: "Device limit:",
    pt: "Limite do dispositivo:",
  },
  "device.type": {
    es: "Tipo",
    en: "Type",
    pt: "Tipo",
  },
  "device.disclaimer": {
    es: "El límite se calcula al 80% de la capacidad estimada de tu dispositivo (RAM, CPU, GPU y plataforma) para evitar sobrecarga. Todo el cifrado ocurre localmente.",
    en: "The limit is calculated at 80% of your device's estimated capacity (RAM, CPU, GPU, and platform) to prevent overload. All encryption happens locally.",
    pt: "O limite é calculado a 80% da capacidade estimada do seu dispositivo (RAM, CPU, GPU e plataforma) para evitar sobrecarga. Toda a criptografia acontece localmente.",
  },
  "device.learnmore": {
    es: "Más información sobre los límites",
    en: "Learn more about limits",
    pt: "Mais informações sobre os limites",
  },

  // ─── Device page ───
  "devicepage.badge": {
    es: "RENDIMIENTO DEL DISPOSITIVO",
    en: "DEVICE PERFORMANCE",
    pt: "DESEMPENHO DO DISPOSITIVO",
  },
  "devicepage.title": {
    es: "Rendimiento y límites",
    en: "Performance & Limits",
    pt: "Desempenho e limites",
  },
  "devicepage.subtitle": {
    es: "Cómo Zefer detecta las capacidades de tu dispositivo y cómo optimizar tu navegador para el máximo rendimiento de cifrado.",
    en: "How Zefer detects your device capabilities and how to optimize your browser for maximum encryption performance.",
    pt: "Como o Zefer detecta as capacidades do seu dispositivo e como otimizar seu navegador para máximo desempenho de criptografia.",
  },
  "devicepage.your": {
    es: "Tu dispositivo",
    en: "Your device",
    pt: "Seu dispositivo",
  },
  "devicepage.reported": {
    es: "reportada",
    en: "reported",
    pt: "reportada",
  },
  "devicepage.raw": {
    es: "string original",
    en: "raw string",
    pt: "string original",
  },
  "devicepage.platform": {
    es: "Plataforma",
    en: "Platform",
    pt: "Plataforma",
  },
  "devicepage.used": {
    es: "en uso",
    en: "in use",
    pt: "em uso",
  },
  "devicepage.maxfile": {
    es: "Límite máximo de archivo",
    en: "Maximum file limit",
    pt: "Limite máximo de arquivo",
  },
  "devicepage.formula.title": {
    es: "¿Cómo se calcula el límite?",
    en: "How is the limit calculated?",
    pt: "Como o limite é calculado?",
  },
  "devicepage.formula.desc": {
    es: "El navegador necesita aproximadamente 3 veces el tamaño del archivo en memoria RAM durante el cifrado: una copia para los bytes del archivo original, otra para la salida cifrada y otra para el procesamiento intermedio (base64, compresión). Se usa el 50% del heap limit del proceso JavaScript como memoria disponible, y se aplica un margen de seguridad del 80% para evitar que el navegador se quede sin memoria.",
    en: "The browser needs approximately 3 times the file size in RAM during encryption: one copy for the original file bytes, another for the encrypted output, and another for intermediate processing (base64, compression). 50% of the JavaScript process heap limit is used as available memory, and an 80% safety margin is applied to prevent the browser from running out of memory.",
    pt: "O navegador precisa de aproximadamente 3 vezes o tamanho do arquivo em memória RAM durante a criptografia: uma cópia para os bytes do arquivo original, outra para a saída criptografada e outra para o processamento intermediário (base64, compressão). 50% do heap limit do processo JavaScript é usado como memória disponível, e uma margem de segurança de 80% é aplicada para evitar que o navegador fique sem memória.",
  },
  "devicepage.sources.title": {
    es: "Fuentes de datos",
    en: "Data sources",
    pt: "Fontes de dados",
  },
  "devicepage.sources.browser": {
    es: "Navegadores",
    en: "Browsers",
    pt: "Navegadores",
  },
  "devicepage.sources.data": {
    es: "Dato obtenido",
    en: "Data obtained",
    pt: "Dado obtido",
  },
  "devicepage.sources.heap": {
    es: "Límite del heap JS (más preciso)",
    en: "JS heap limit (most accurate)",
    pt: "Limite do heap JS (mais preciso)",
  },
  "devicepage.sources.ram": {
    es: "RAM total del dispositivo (redondeada)",
    en: "Total device RAM (rounded)",
    pt: "RAM total do dispositivo (arredondada)",
  },
  "devicepage.sources.all": {
    es: "Todos",
    en: "All",
    pt: "Todos",
  },
  "devicepage.sources.most": {
    es: "La mayoría",
    en: "Most",
    pt: "A maioria",
  },
  "devicepage.sources.cores": {
    es: "Número de núcleos del CPU",
    en: "Number of CPU cores",
    pt: "Número de núcleos do CPU",
  },
  "devicepage.sources.gpu": {
    es: "Modelo de GPU (vía WebGL)",
    en: "GPU model (via WebGL)",
    pt: "Modelo de GPU (via WebGL)",
  },
  "devicepage.sources.bench": {
    es: "Velocidad real de PBKDF2 en el dispositivo",
    en: "Actual PBKDF2 speed on the device",
    pt: "Velocidade real do PBKDF2 no dispositivo",
  },
  "devicepage.optimize.title": {
    es: "¿Cómo optimizar tu navegador?",
    en: "How to optimize your browser?",
    pt: "Como otimizar seu navegador?",
  },
  "devicepage.optimize.chrome": {
    es: "Cierra pestañas y extensiones innecesarias para liberar memoria|Abre chrome://flags y busca «Experimental Web Platform features» para habilitar APIs avanzadas|Usa el modo de 64 bits para acceder a más de 4 GB de heap|Inicia Chrome con --max-old-space-size=8192 para aumentar el heap de V8",
    en: "Close unnecessary tabs and extensions to free memory|Open chrome://flags and search for 'Experimental Web Platform features' to enable advanced APIs|Use the 64-bit version to access more than 4 GB of heap|Launch Chrome with --max-old-space-size=8192 to increase V8 heap",
    pt: "Feche abas e extensões desnecessárias para liberar memória|Abra chrome://flags e busque 'Experimental Web Platform features' para habilitar APIs avançadas|Use a versão de 64 bits para acessar mais de 4 GB de heap|Inicie o Chrome com --max-old-space-size=8192 para aumentar o heap do V8",
  },
  "devicepage.optimize.firefox": {
    es: "Firefox no expone performance.memory ni navigator.deviceMemory por privacidad|El límite se estima a partir del número de núcleos del CPU|Abre about:config y ajusta dom.ipc.processCount para más procesos|Cierra pestañas innecesarias: Firefox usa procesos separados por pestaña",
    en: "Firefox does not expose performance.memory or navigator.deviceMemory for privacy|The limit is estimated from the number of CPU cores|Open about:config and adjust dom.ipc.processCount for more processes|Close unnecessary tabs: Firefox uses separate processes per tab",
    pt: "O Firefox não expõe performance.memory nem navigator.deviceMemory por privacidade|O limite é estimado a partir do número de núcleos do CPU|Abra about:config e ajuste dom.ipc.processCount para mais processos|Feche abas desnecessárias: o Firefox usa processos separados por aba",
  },
  "devicepage.optimize.safari": {
    es: "Safari no expone las APIs de memoria del navegador|El límite se estima a partir del número de núcleos y la plataforma|Safari en macOS tiene un heap generoso (hasta ~4 GB en dispositivos con 8+ GB de RAM)|En iOS el heap está más limitado (~1.4 GB en iPhones modernos)",
    en: "Safari does not expose browser memory APIs|The limit is estimated from the number of cores and platform|Safari on macOS has a generous heap (up to ~4 GB on devices with 8+ GB RAM)|On iOS the heap is more limited (~1.4 GB on modern iPhones)",
    pt: "O Safari não expõe as APIs de memória do navegador|O limite é estimado a partir do número de núcleos e da plataforma|O Safari no macOS tem um heap generoso (até ~4 GB em dispositivos com 8+ GB de RAM)|No iOS o heap é mais limitado (~1.4 GB em iPhones modernos)",
  },
  "devicepage.optimize.general.title": {
    es: "Recomendaciones generales",
    en: "General recommendations",
    pt: "Recomendações gerais",
  },
  "devicepage.optimize.general": {
    es: "Usa un navegador basado en Chromium (Chrome, Edge, Brave) para mejor detección de hardware|Cierra otras aplicaciones pesadas antes de cifrar archivos grandes|Usa la versión de 64 bits de tu navegador|Asegúrate de tener suficiente espacio en disco para la descarga del archivo .zefer|Desactiva las extensiones del navegador que consuman mucha memoria",
    en: "Use a Chromium-based browser (Chrome, Edge, Brave) for better hardware detection|Close other heavy applications before encrypting large files|Use the 64-bit version of your browser|Make sure you have enough disk space for the .zefer file download|Disable browser extensions that consume a lot of memory",
    pt: "Use um navegador baseado em Chromium (Chrome, Edge, Brave) para melhor detecção de hardware|Feche outros aplicativos pesados antes de criptografar arquivos grandes|Use a versão de 64 bits do seu navegador|Certifique-se de ter espaço suficiente em disco para o download do arquivo .zefer|Desative extensões do navegador que consomem muita memória",
  },
  "devicepage.na.title": {
    es: "¿Por qué algunos valores aparecen como «N/A»?",
    en: "Why do some values show as 'N/A'?",
    pt: "Por que alguns valores aparecem como 'N/A'?",
  },
  "devicepage.na.desc": {
    es: "Algunos navegadores (Firefox, Safari) no exponen las APIs de memoria por razones de privacidad. En esos casos, Zefer estima el límite a partir del número de núcleos del CPU y la plataforma. Para obtener la detección más precisa, usa Chrome o Edge, que exponen performance.memory y navigator.deviceMemory.",
    en: "Some browsers (Firefox, Safari) do not expose memory APIs for privacy reasons. In those cases, Zefer estimates the limit from the number of CPU cores and the platform. For the most accurate detection, use Chrome or Edge, which expose performance.memory and navigator.deviceMemory.",
    pt: "Alguns navegadores (Firefox, Safari) não expõem as APIs de memória por razões de privacidade. Nesses casos, o Zefer estima o limite a partir do número de núcleos do CPU e da plataforma. Para a detecção mais precisa, use Chrome ou Edge, que expõem performance.memory e navigator.deviceMemory.",
  },

  // ─── Input modes ───
  "mode.text": {
    es: "Texto",
    en: "Text",
    pt: "Texto",
  },
  "mode.file": {
    es: "Archivo",
    en: "File",
    pt: "Arquivo",
  },
  "mode.file.label": {
    es: "Selecciona un archivo para cifrar",
    en: "Select a file to encrypt",
    pt: "Selecione um arquivo para criptografar",
  },
  "mode.file.placeholder": {
    es: "Haz clic para seleccionar cualquier archivo",
    en: "Click to select any file",
    pt: "Clique para selecionar qualquer arquivo",
  },
  "mode.file.limit": {
    es: "Límite:",
    en: "Limit:",
    pt: "Limite:",
  },

  // ─── Shared form ───
  "form.content.label": {
    es: "Contenido secreto",
    en: "Secret content",
    pt: "Conteúdo secreto",
  },
  "form.content.placeholder": {
    es: "Pega tu secreto aquí: claves de API, contraseñas, variables de entorno…",
    en: "Paste your secret here — API keys, passwords, env variables...",
    pt: "Cole seu segredo aqui: chaves de API, senhas, variáveis de ambiente…",
  },
  "form.passphrase": {
    es: "Frase clave",
    en: "Passphrase",
    pt: "Frase-chave",
  },
  "form.passphrase.placeholder": {
    es: "Mínimo 6 caracteres",
    en: "Minimum 6 characters",
    pt: "Mínimo de 6 caracteres",
  },
  "form.expires": {
    es: "Expira en:",
    en: "Expires in:",
    pt: "Expira em:",
  },
  "form.encrypting": {
    es: "Cifrando…",
    en: "Encrypting...",
    pt: "Criptografando…",
  },
  "form.security.note": {
    es: "Cifrado AES-256-GCM con derivación de clave PBKDF2 (600 mil iteraciones). Todo ocurre en tu navegador; nada se envía a ningún servidor.",
    en: "AES-256-GCM encryption with PBKDF2 key derivation (600k iterations). Everything happens in your browser — nothing is sent to any server.",
    pt: "Criptografia AES-256-GCM com derivação de chave PBKDF2 (600 mil iterações). Tudo acontece no seu navegador; nada é enviado a nenhum servidor.",
  },
  "form.error.empty": {
    es: "Ingresa un secreto para cifrar.",
    en: "Enter a secret to encrypt.",
    pt: "Insira um segredo para criptografar.",
  },
  "form.error.passphrase": {
    es: "La frase clave debe tener al menos 6 caracteres.",
    en: "Passphrase must be at least 6 characters.",
    pt: "A frase-chave deve ter pelo menos 6 caracteres.",
  },
  "form.error.generic": {
    es: "Algo salió mal. Inténtalo de nuevo.",
    en: "Something went wrong. Please try again.",
    pt: "Algo deu errado. Tente novamente.",
  },
  "form.error.file.type": {
    es: "Solo se aceptan archivos .txt y .env.",
    en: "Only .txt and .env files are accepted.",
    pt: "Apenas arquivos .txt e .env são aceitos.",
  },
  "form.error.file.size": {
    es: "El archivo de texto debe pesar menos de 256 KB.",
    en: "Text file size must be under 256 KB.",
    pt: "O arquivo de texto deve ter menos de 256 KB.",
  },
  "form.error.file.max": {
    es: "El archivo excede el límite de este dispositivo:",
    en: "File exceeds this device's limit:",
    pt: "O arquivo excede o limite deste dispositivo:",
  },
  "form.error.nofile": {
    es: "Selecciona un archivo para cifrar.",
    en: "Select a file to encrypt.",
    pt: "Selecione um arquivo para criptografar.",
  },
  "form.error.binary": {
    es: "El contenido parece ser un archivo binario. Usa el modo Archivo para cifrar este tipo de contenido.",
    en: "The content appears to be a binary file. Use File mode to encrypt this type of content.",
    pt: "O conteúdo parece ser um arquivo binário. Use o modo Arquivo para criptografar este tipo de conteúdo.",
  },
  "form.error.file.usetext": {
    es: "Los archivos .txt y .env deben cifrarse en modo Texto. Cambia al modo Texto y carga el archivo allí.",
    en: ".txt and .env files must be encrypted in Text mode. Switch to Text mode and upload the file there.",
    pt: "Arquivos .txt e .env devem ser criptografados no modo Texto. Mude para o modo Texto e carregue o arquivo lá.",
  },
  "success.copied": {
    es: "¡Copiado!",
    en: "Copied!",
    pt: "Copiado!",
  },
  "form.error.passphrase2": {
    es: "La segunda frase clave debe tener al menos 6 caracteres.",
    en: "The second passphrase must be at least 6 characters.",
    pt: "A segunda frase-chave deve ter pelo menos 6 caracteres.",
  },
  "form.error.noanswer": {
    es: "Debes proporcionar la respuesta a la pregunta secreta.",
    en: "You must provide the answer to the secret question.",
    pt: "Você deve fornecer a resposta à pergunta secreta.",
  },

  // ─── Advanced options ───
  "advanced.title": {
    es: "Opciones avanzadas",
    en: "Advanced options",
    pt: "Opções avançadas",
  },
  "advanced.security": {
    es: "Nivel de seguridad",
    en: "Security level",
    pt: "Nível de segurança",
  },
  "security.standard": {
    es: "Estándar (300k)",
    en: "Standard (300k)",
    pt: "Padrão (300k)",
  },
  "security.high": {
    es: "Alto (600k)",
    en: "High (600k)",
    pt: "Alto (600k)",
  },
  "security.maximum": {
    es: "Máximo (1M)",
    en: "Maximum (1M)",
    pt: "Máximo (1M)",
  },
  "advanced.compression": {
    es: "Compresión",
    en: "Compression",
    pt: "Compressão",
  },
  "compression.none": {
    es: "Sin compresión",
    en: "None",
    pt: "Sem compressão",
  },
  "compression.gzip": {
    es: "Gzip",
    en: "Gzip",
    pt: "Gzip",
  },
  "compression.deflate": {
    es: "Deflate",
    en: "Deflate",
    pt: "Deflate",
  },
  "advanced.dualkey": {
    es: "Doble frase clave",
    en: "Dual passphrase",
    pt: "Dupla frase-chave",
  },
  "advanced.dualkey.placeholder": {
    es: "Segunda frase clave (mínimo 6 caracteres)",
    en: "Second passphrase (minimum 6 characters)",
    pt: "Segunda frase-chave (mínimo de 6 caracteres)",
  },
  "advanced.dualkey.label2": {
    es: "Segunda frase clave",
    en: "Second passphrase",
    pt: "Segunda frase-chave",
  },
  "advanced.attempts": {
    es: "Intentos máximos de descifrado",
    en: "Maximum decryption attempts",
    pt: "Tentativas máximas de descriptografia",
  },
  "advanced.attempts.unlimited": {
    es: "Ilimitados",
    en: "Unlimited",
    pt: "Ilimitadas",
  },
  "advanced.hint": {
    es: "Pista de contraseña",
    en: "Password hint",
    pt: "Dica de senha",
  },
  "advanced.hint.placeholder": {
    es: "Visible antes de descifrar (opcional)",
    en: "Visible before decrypting (optional)",
    pt: "Visível antes de descriptografar (opcional)",
  },
  "advanced.note": {
    es: "Nota pública",
    en: "Public note",
    pt: "Nota pública",
  },
  "advanced.note.placeholder": {
    es: "Asunto o instrucciones visibles sin descifrar (opcional)",
    en: "Subject or instructions visible without decrypting (optional)",
    pt: "Assunto ou instruções visíveis sem descriptografar (opcional)",
  },
  "advanced.question": {
    es: "Pregunta secreta",
    en: "Secret question",
    pt: "Pergunta secreta",
  },
  "advanced.question.placeholder": {
    es: "Pregunta que solo el destinatario puede responder (opcional)",
    en: "Question that only the recipient can answer (optional)",
    pt: "Pergunta que somente o destinatário pode responder (opcional)",
  },
  "advanced.question.answer": {
    es: "Respuesta a la pregunta secreta",
    en: "Answer to the secret question",
    pt: "Resposta à pergunta secreta",
  },

  // ─── Reveal key ───
  "advanced.revealkey": {
    es: "Clave de revelado",
    en: "Reveal key",
    pt: "Chave de revelação",
  },
  "advanced.revealkey.placeholder": {
    es: "Clave alternativa para compartir (mínimo 6 caracteres)",
    en: "Alternative key to share (minimum 6 characters)",
    pt: "Chave alternativa para compartilhar (mínimo de 6 caracteres)",
  },
  "advanced.revealkey.help": {
    es: "Comparte esta clave en lugar de tu contraseña principal. Ambas descifran el archivo.",
    en: "Share this key instead of your main passphrase. Both can decrypt the file.",
    pt: "Compartilhe esta chave em vez da sua frase-chave principal. Ambas descriptografam o arquivo.",
  },
  "form.error.revealkey": {
    es: "La clave de revelado debe tener al menos 6 caracteres.",
    en: "The reveal key must be at least 6 characters.",
    pt: "A chave de revelação deve ter pelo menos 6 caracteres.",
  },

  // ─── IP restriction ───
  "advanced.ip": {
    es: "Restricción por IP",
    en: "IP restriction",
    pt: "Restrição por IP",
  },
  "advanced.ip.placeholder": {
    es: "192.168.1.1, 2001:db8::1 (opcional)",
    en: "192.168.1.1, 2001:db8::1 (optional)",
    pt: "192.168.1.1, 2001:db8::1 (opcional)",
  },
  "advanced.ip.help": {
    es: "IPs (v4 o v6) separadas por coma. Solo estas IPs podrán descifrar el archivo.",
    en: "Comma-separated IPs (v4 or v6). Only these IPs will be able to decrypt the file.",
    pt: "IPs (v4 ou v6) separados por vírgula. Somente esses IPs poderão descriptografar o arquivo.",
  },
  "advanced.ip.addmine": {
    es: "+ Mi IP",
    en: "+ My IP",
    pt: "+ Meu IP",
  },
  "advanced.ip.disclaimer": {
    es: "Haz clic en «+ Mi IP» para detectar tu IP pública actual mediante múltiples servicios de verificación cruzada.",
    en: "Click '+ My IP' to detect your current public IP via multiple cross-validation services.",
    pt: "Clique em «+ Meu IP» para detectar seu IP público atual por meio de múltiplos serviços de verificação cruzada.",
  },
  "advanced.ip.vpn": {
    es: "Se detectó que tu IP pertenece a un centro de datos o proveedor VPN. La IP que el destinatario vea al descifrar podría ser diferente si no usa la misma VPN o servicio.",
    en: "Your IP was detected as belonging to a datacenter or VPN provider. The IP the recipient sees when decrypting may be different if they don't use the same VPN or service.",
    pt: "Seu IP foi detectado como pertencente a um datacenter ou provedor VPN. O IP que o destinatário verá ao descriptografar pode ser diferente se não usar a mesma VPN ou serviço.",
  },
  "advanced.ip.inconsistent": {
    es: "Se detectaron múltiples IPs diferentes para tu conexión, lo que puede indicar el uso de un proxy o balanceador de carga. IPs detectadas:",
    en: "Multiple different IPs were detected for your connection, which may indicate a proxy or load balancer. Detected IPs:",
    pt: "Múltiplos IPs diferentes foram detectados para sua conexão, o que pode indicar o uso de um proxy ou balanceador de carga. IPs detectados:",
  },
  "advanced.ip.clean": {
    es: "IP verificada con múltiples servicios. Sin indicios de VPN o proxy.",
    en: "IP verified with multiple services. No VPN or proxy indicators detected.",
    pt: "IP verificado com múltiplos serviços. Sem indícios de VPN ou proxy.",
  },
  "decrypt.error.ipblocked": {
    es: "Tu dirección IP no está autorizada para descifrar este archivo.",
    en: "Your IP address is not authorized to decrypt this file.",
    pt: "Seu endereço IP não está autorizado a descriptografar este arquivo.",
  },
  "decrypt.ipblocked.title": {
    es: "Acceso denegado",
    en: "Access denied",
    pt: "Acesso negado",
  },
  "decrypt.ipblocked.desc": {
    es: "Este archivo .zefer fue cifrado con una restricción de IP. Tu dirección IP actual no coincide con ninguna de las direcciones autorizadas por el creador del archivo. Contacta a la persona que te envió el archivo para que agregue tu IP a la lista de autorizados.",
    en: "This .zefer file was encrypted with an IP restriction. Your current IP address does not match any of the addresses authorized by the file creator. Contact the person who sent you the file to add your IP to the authorized list.",
    pt: "Este arquivo .zefer foi criptografado com uma restrição de IP. Seu endereço IP atual não corresponde a nenhum dos endereços autorizados pelo criador do arquivo. Entre em contato com a pessoa que lhe enviou o arquivo para adicionar seu IP à lista de autorizados.",
  },
  "decrypt.ipblocked.yourip": {
    es: "Tu IP detectada:",
    en: "Your detected IP:",
    pt: "Seu IP detectado:",
  },

  // ─── Decrypt extra errors ───
  "decrypt.dualkey.toggle": {
    es: "Usar doble frase clave",
    en: "Use dual passphrase",
    pt: "Usar dupla frase-chave",
  },
  "decrypt.question.label": {
    es: "Este archivo requiere responder una pregunta secreta",
    en: "This file requires answering a secret question",
    pt: "Este arquivo requer responder uma pergunta secreta",
  },
  "decrypt.error.noanswer": {
    es: "Este archivo requiere responder una pregunta secreta. Proporciona la respuesta e inténtalo de nuevo.",
    en: "This file requires answering a secret question. Provide the answer and try again.",
    pt: "Este arquivo requer responder uma pergunta secreta. Forneça a resposta e tente novamente.",
  },
  "decrypt.error.wronganswer": {
    es: "La respuesta a la pregunta secreta es incorrecta.",
    en: "The answer to the secret question is incorrect.",
    pt: "A resposta à pergunta secreta está incorreta.",
  },
  "decrypt.error.maxattempts": {
    es: "Se agotaron los intentos de descifrado para este archivo.",
    en: "Maximum decryption attempts exceeded for this file.",
    pt: "O número máximo de tentativas de descriptografia foi excedido para este arquivo.",
  },
  "decrypt.blocked.title": {
    es: "Archivo bloqueado",
    en: "File blocked",
    pt: "Arquivo bloqueado",
  },
  "decrypt.blocked.desc": {
    es: "Se ha alcanzado el número máximo de intentos de descifrado. Este archivo no puede ser descifrado en este dispositivo.",
    en: "The maximum number of decryption attempts has been reached. This file cannot be decrypted on this device.",
    pt: "O número máximo de tentativas de descriptografia foi atingido. Este arquivo não pode ser descriptografado neste dispositivo.",
  },
  "decrypt.info.note": {
    es: "Nota",
    en: "Note",
    pt: "Nota",
  },
  "decrypt.info.hint": {
    es: "Pista",
    en: "Hint",
    pt: "Dica",
  },

  // ─── Key generator ───
  "keygen.title": {
    es: "Generar clave segura",
    en: "Generate secure key",
    pt: "Gerar chave segura",
  },
  "keygen.unicode": {
    es: "Unicode",
    en: "Unicode",
    pt: "Unicode",
  },
  "keygen.unicode.desc": {
    es: "Incluye latín, árabe, japonés, chino, coreano, griego, cirílico, símbolos matemáticos, monedas y emojis.",
    en: "Includes Latin, Arabic, Japanese, Chinese, Korean, Greek, Cyrillic, math symbols, currencies, and emojis.",
    pt: "Inclui latim, árabe, japonês, chinês, coreano, grego, cirílico, símbolos matemáticos, moedas e emojis.",
  },
  "keygen.secure": {
    es: "Segura",
    en: "Secure",
    pt: "Segura",
  },
  "keygen.alpha": {
    es: "Alfanum.",
    en: "Alphanum.",
    pt: "Alfanum.",
  },
  "keygen.hex": {
    es: "Hex",
    en: "Hex",
    pt: "Hex",
  },
  "keygen.uuid": {
    es: "UUID",
    en: "UUID",
    pt: "UUID",
  },
  "keygen.length": {
    es: "Longitud",
    en: "Length",
    pt: "Comprimento",
  },
  "keygen.chars": {
    es: "caracteres",
    en: "characters",
    pt: "caracteres",
  },
  "keygen.regenerate": {
    es: "Regenerar",
    en: "Regenerate",
    pt: "Regenerar",
  },
  "keygen.use": {
    es: "Usar esta clave",
    en: "Use this key",
    pt: "Usar esta chave",
  },

  // ─── Progress ───
  "progress.compressing": {
    es: "Comprimiendo datos…",
    en: "Compressing data...",
    pt: "Comprimindo dados…",
  },
  "progress.deriving": {
    es: "Derivando clave criptográfica…",
    en: "Deriving cryptographic key...",
    pt: "Derivando chave criptográfica…",
  },
  "progress.encrypting": {
    es: "Cifrando contenido…",
    en: "Encrypting content...",
    pt: "Criptografando conteúdo…",
  },
  "progress.packaging": {
    es: "Empaquetando archivo .zefer…",
    en: "Packaging .zefer file...",
    pt: "Empacotando arquivo .zefer…",
  },
  "progress.decrypting": {
    es: "Descifrando contenido…",
    en: "Decrypting content...",
    pt: "Descriptografando conteúdo…",
  },
  "progress.decompressing": {
    es: "Descomprimiendo datos…",
    en: "Decompressing data...",
    pt: "Descomprimindo dados…",
  },
  "progress.verifying": {
    es: "Verificando integridad…",
    en: "Verifying integrity...",
    pt: "Verificando integridade…",
  },
  "progress.done": {
    es: "¡Completado!",
    en: "Complete!",
    pt: "Concluído!",
  },

  // ─── TTL options ───
  "ttl.30min": { es: "30 min", en: "30 min", pt: "30 min" },
  "ttl.1hour": { es: "1 hora", en: "1 hour", pt: "1 hora" },
  "ttl.24hours": { es: "24 horas", en: "24 hours", pt: "24 horas" },
  "ttl.7days": { es: "7 días", en: "7 days", pt: "7 dias" },
  "ttl.2weeks": { es: "2 semanas", en: "2 weeks", pt: "2 semanas" },
  "ttl.never": { es: "Sin expiración", en: "No expiration", pt: "Sem expiração" },

  // ─── Footer ───
  "footer.tagline": {
    es: "Cifrado de extremo a extremo · Zero-knowledge · 100% en tu navegador",
    en: "End-to-end encrypted · Zero-knowledge · 100% in your browser",
    pt: "Criptografia ponta a ponta · Zero-knowledge · 100% no seu navegador",
  },
  "footer.privacy": {
    es: "Privacidad y seguridad",
    en: "Privacy & Security",
    pt: "Privacidade e segurança",
  },
  "footer.product": {
    es: "Producto",
    en: "Product",
    pt: "Produto",
  },
  "footer.product.home": {
    es: "Inicio",
    en: "Home",
    pt: "Início",
  },
  "footer.product.how": {
    es: "¿Cómo funciona?",
    en: "How it works",
    pt: "Como funciona",
  },
  "footer.product.device": {
    es: "Rendimiento",
    en: "Performance",
    pt: "Desempenho",
  },
  "footer.security": {
    es: "Seguridad",
    en: "Security",
    pt: "Segurança",
  },
  "footer.security.encryption": {
    es: "Cifrado AES-256",
    en: "AES-256 Encryption",
    pt: "Criptografia AES-256",
  },
  "footer.security.zeroknowledge": {
    es: "Zero-Knowledge",
    en: "Zero-Knowledge",
    pt: "Zero-Knowledge",
  },
  "footer.legal": {
    es: "Legal",
    en: "Legal",
    pt: "Legal",
  },
  "footer.terms": {
    es: "Términos y condiciones",
    en: "Terms & Conditions",
    pt: "Termos e condições",
  },
  "footer.desc": {
    es: "Cifra información sensible en archivos .zefer protegidos con contraseña. Todo ocurre en tu navegador; ningún dato toca nuestros servidores.",
    en: "Encrypt sensitive information into password-protected .zefer files. Everything happens in your browser — no data ever touches our servers.",
    pt: "Criptografe informações sensíveis em arquivos .zefer protegidos por senha. Tudo acontece no seu navegador; nenhum dado toca nossos servidores.",
  },
  "footer.rights": {
    es: "Todos los derechos reservados.",
    en: "All rights reserved.",
    pt: "Todos os direitos reservados.",
  },
  "footer.developer": {
    es: "Desarrollado por",
    en: "Built by",
    pt: "Desenvolvido por",
  },
  "form.burn": {
    es: "Expiración temporal",
    en: "Time-based expiration",
    pt: "Expiração temporária",
  },

  // ─── How it works ───
  "how.subtitle": {
    es: "Cada paso del proceso de cifrado, explicado en detalle",
    en: "Understanding every step of the encryption process",
    pt: "Cada etapa do processo de criptografia, explicada em detalhe",
  },
  "how.overview.title": {
    es: "Visión general",
    en: "Overview",
    pt: "Visão geral",
  },
  "how.overview.desc": {
    es: "Zefer es una herramienta 100% del lado del cliente. Todo el procesamiento criptográfico ocurre en tu navegador. No existe servidor que almacene, procese o transmita tus datos. Puedes cifrar texto plano o cualquier tipo de archivo (imágenes, ZIPs, PDFs, etc.) en un archivo .zefer protegido con contraseña, con opciones avanzadas de seguridad como doble frase clave, clave de revelado, pregunta secreta, restricción por IP, expiración y compresión.",
    en: "Zefer is a 100% client-side tool. All cryptographic processing happens in your browser. There is no server that stores, processes, or transmits your data. You can encrypt plain text or any file type (images, ZIPs, PDFs, etc.) into a password-protected .zefer file, with advanced security options like dual passphrase, reveal key, secret question, IP restriction, expiration, and compression.",
    pt: "O Zefer é uma ferramenta 100% do lado do cliente. Todo o processamento criptográfico acontece no seu navegador. Não existe servidor que armazene, processe ou transmita seus dados. Você pode criptografar texto simples ou qualquer tipo de arquivo (imagens, ZIPs, PDFs, etc.) em um arquivo .zefer protegido por senha, com opções avançadas de segurança como dupla frase-chave, chave de revelação, pergunta secreta, restrição por IP, expiração e compressão.",
  },
  "how.step1.title": {
    es: "Paso 1: Ingreso del contenido",
    en: "Step 1: Content input",
    pt: "Etapa 1: Entrada do conteúdo",
  },
  "how.step1.desc": {
    es: "Seleccionas el modo Texto o Archivo. En modo texto, escribes o pegas tu secreto directamente. En modo archivo, cargas cualquier tipo de archivo (imágenes, ZIPs, PDFs, etc.) con un límite dinámico basado en la capacidad de tu dispositivo. También defines una frase clave y una fecha de expiración. Todo permanece exclusivamente en la memoria de tu navegador.",
    en: "You select Text or File mode. In text mode, you type or paste your secret directly. In file mode, you upload any file type (images, ZIPs, PDFs, etc.) with a dynamic limit based on your device's capacity. You also define a passphrase and an expiration date. Everything remains exclusively in your browser's memory.",
    pt: "Você seleciona o modo Texto ou Arquivo. No modo texto, digita ou cola seu segredo diretamente. No modo arquivo, carrega qualquer tipo de arquivo (imagens, ZIPs, PDFs, etc.) com um limite dinâmico baseado na capacidade do seu dispositivo. Você também define uma frase-chave e uma data de expiração. Tudo permanece exclusivamente na memória do seu navegador.",
  },
  "how.step2.title": {
    es: "Paso 2: Derivación de clave con PBKDF2",
    en: "Step 2: Key derivation with PBKDF2",
    pt: "Etapa 2: Derivação de chave com PBKDF2",
  },
  "how.step2.desc": {
    es: "Tu frase clave se transforma en una clave criptográfica de 256 bits mediante PBKDF2-SHA256 con 600.000 iteraciones y un salt aleatorio y único de 32 bytes. Este proceso garantiza que incluso frases clave simples produzcan claves extremadamente fuertes.",
    en: "Your passphrase is transformed into a 256-bit cryptographic key using PBKDF2-SHA256 with 600,000 iterations and a unique random 32-byte salt. This process ensures even simple passphrases produce extremely strong keys.",
    pt: "Sua frase-chave é transformada em uma chave criptográfica de 256 bits por meio do PBKDF2-SHA256 com 600.000 iterações e um salt aleatório e único de 32 bytes. Esse processo garante que mesmo frases-chave simples produzam chaves extremamente fortes.",
  },
  "how.step3.title": {
    es: "Paso 3: Cifrado AES-256-GCM",
    en: "Step 3: AES-256-GCM encryption",
    pt: "Etapa 3: Criptografia AES-256-GCM",
  },
  "how.step3.desc": {
    es: "Tu contenido, junto con la fecha de expiración y los metadatos, se cifra como una sola pieza usando AES-256-GCM con un vector de inicialización (IV) aleatorio de 12 bytes. La expiración vive dentro del texto cifrado, por lo que no puede alterarse sin la clave correcta.",
    en: "Your content, along with the expiration date and metadata, is encrypted as a single piece using AES-256-GCM with a random 12-byte initialization vector (IV). The expiration lives inside the ciphertext, so it cannot be tampered with without the correct key.",
    pt: "Seu conteúdo, junto com a data de expiração e os metadados, é criptografado como uma única peça usando AES-256-GCM com um vetor de inicialização (IV) aleatório de 12 bytes. A expiração está dentro do texto cifrado, por isso não pode ser alterada sem a chave correta.",
  },
  "how.step4.title": {
    es: "Paso 4: Generación del archivo .zefer",
    en: "Step 4: .zefer file generation",
    pt: "Etapa 4: Geração do arquivo .zefer",
  },
  "how.step4.desc": {
    es: "El texto cifrado se empaqueta en un archivo .zefer que se descarga directamente a tu dispositivo. Ningún dato sale de tu navegador. No hay servidor involucrado en ningún momento del proceso.",
    en: "The ciphertext is packaged into a .zefer file that is downloaded directly to your device. No data leaves your browser. There is no server involved at any point in the process.",
    pt: "O texto cifrado é empacotado em um arquivo .zefer que é baixado diretamente no seu dispositivo. Nenhum dado sai do seu navegador. Não há servidor envolvido em nenhum momento do processo.",
  },
  "how.step5.title": {
    es: "Paso 5: Envío del archivo",
    en: "Step 5: Sending the file",
    pt: "Etapa 5: Envio do arquivo",
  },
  "how.step5.desc": {
    es: "Envías el archivo .zefer a tu destinatario por cualquier canal: correo electrónico, chat o SMS. La frase clave debe comunicarse por un canal separado para mayor seguridad. Sin la frase clave, el archivo es completamente ilegible.",
    en: "You send the .zefer file to your recipient through any channel: email, chat, or SMS. The passphrase should be communicated through a separate channel for maximum security. Without the passphrase, the file is completely unreadable.",
    pt: "Você envia o arquivo .zefer ao seu destinatário por qualquer canal: e-mail, chat ou SMS. A frase-chave deve ser comunicada por um canal separado para maior segurança. Sem a frase-chave, o arquivo é completamente ilegível.",
  },
  "how.step6.title": {
    es: "Paso 6: Descifrado por el destinatario",
    en: "Step 6: Decryption by the recipient",
    pt: "Etapa 6: Descriptografia pelo destinatário",
  },
  "how.step6.desc": {
    es: "El destinatario sube el archivo .zefer a Zefer e ingresa la frase clave. Su navegador repite el proceso de derivación de clave, descifra el contenido y verifica la expiración. Si la frase clave es incorrecta, el descifrado falla sin revelar información. Si el archivo expiró, se rechaza el acceso.",
    en: "The recipient uploads the .zefer file to Zefer and enters the passphrase. Their browser repeats the key derivation process, decrypts the content, and checks the expiration. If the passphrase is incorrect, decryption fails revealing no information. If the file has expired, access is denied.",
    pt: "O destinatário envia o arquivo .zefer ao Zefer e insere a frase-chave. Seu navegador repete o processo de derivação de chave, descriptografa o conteúdo e verifica a expiração. Se a frase-chave estiver incorreta, a descriptografia falha sem revelar informações. Se o arquivo expirou, o acesso é negado.",
  },
  "how.step7.title": {
    es: "Paso 7: Visualización o descarga",
    en: "Step 7: View or download",
    pt: "Etapa 7: Visualização ou download",
  },
  "how.step7.desc": {
    es: "Una vez descifrado, el destinatario puede ver el contenido directamente en el navegador, copiarlo al portapapeles o descargarlo como archivo de texto. En ningún momento los datos pasan por un servidor.",
    en: "Once decrypted, the recipient can view the content directly in the browser, copy it to the clipboard, or download it as a text file. At no point does the data pass through a server.",
    pt: "Após descriptografar, o destinatário pode visualizar o conteúdo diretamente no navegador, copiá-lo para a área de transferência ou baixá-lo como arquivo de texto. Em nenhum momento os dados passam por um servidor.",
  },
  "how.technical.title": {
    es: "Especificaciones técnicas",
    en: "Technical specifications",
    pt: "Especificações técnicas",
  },
  "how.tech.algorithm": { es: "Algoritmo de cifrado", en: "Encryption algorithm", pt: "Algoritmo de criptografia" },
  "how.tech.keyderiv": { es: "Derivación de clave", en: "Key derivation", pt: "Derivação de chave" },
  "how.tech.iterations": { es: "Iteraciones", en: "Iterations", pt: "Iterações" },
  "how.tech.saltsize": { es: "Tamaño del salt", en: "Salt size", pt: "Tamanho do salt" },
  "how.tech.ivsize": { es: "Tamaño del IV", en: "IV size", pt: "Tamanho do IV" },
  "how.tech.keysize": { es: "Tamaño de clave", en: "Key size", pt: "Tamanho da chave" },
  "how.tech.api": { es: "API criptográfica", en: "Crypto API", pt: "API criptográfica" },
  "how.tech.maxttl": { es: "Expiración máxima", en: "Max expiration", pt: "Expiração máxima" },
  "how.tech.maxfile": { es: "Tamaño máx. de archivo", en: "Max file size", pt: "Tamanho máx. de arquivo" },
  "how.tech.filetypes": { es: "Tipos de archivo", en: "File types", pt: "Tipos de arquivo" },
  "how.tech.server": { es: "Servidor", en: "Server", pt: "Servidor" },
  "how.cta": {
    es: "Probar ahora",
    en: "Try it now",
    pt: "Experimentar agora",
  },
  "how.cta.desc": {
    es: "Crea tu primer archivo .zefer cifrado en segundos.",
    en: "Create your first encrypted .zefer file in seconds.",
    pt: "Crie seu primeiro arquivo .zefer criptografado em segundos.",
  },

  // How — features section
  "how.features.title": {
    es: "Opciones avanzadas de seguridad",
    en: "Advanced security options",
    pt: "Opções avançadas de segurança",
  },
  "how.feat.advanced.title": {
    es: "Nivel de seguridad configurable",
    en: "Configurable security level",
    pt: "Nível de segurança configurável",
  },
  "how.feat.advanced.desc": {
    es: "Elige entre 300k, 600k o 1 millón de iteraciones PBKDF2. Más iteraciones = más lento de descifrar = más seguro contra fuerza bruta.",
    en: "Choose between 300k, 600k, or 1 million PBKDF2 iterations. More iterations = slower to decrypt = more secure against brute force.",
    pt: "Escolha entre 300k, 600k ou 1 milhão de iterações PBKDF2. Mais iterações = mais lento para descriptografar = mais seguro contra força bruta.",
  },
  "how.feat.reveal.title": {
    es: "Clave de revelado y doble frase clave",
    en: "Reveal key and dual passphrase",
    pt: "Chave de revelação e dupla frase-chave",
  },
  "how.feat.reveal.desc": {
    es: "Genera una clave de revelado para compartir sin exponer tu contraseña principal. También puedes requerir dos frases clave de personas distintas para descifrar.",
    en: "Generate a reveal key to share without exposing your main password. You can also require two passphrases from different people to decrypt.",
    pt: "Gere uma chave de revelação para compartilhar sem expor sua senha principal. Você também pode exigir duas frases-chave de pessoas diferentes para descriptografar.",
  },
  "how.feat.ip.title": {
    es: "Restricción por IP",
    en: "IP restriction",
    pt: "Restrição por IP",
  },
  "how.feat.ip.desc": {
    es: "Limita el descifrado a direcciones IP específicas (IPv4 e IPv6). La lista de IPs está cifrada dentro del archivo y no es visible sin la clave.",
    en: "Restrict decryption to specific IP addresses (IPv4 and IPv6). The IP list is encrypted inside the file and is not visible without the key.",
    pt: "Restrinja a descriptografia a endereços IP específicos (IPv4 e IPv6). A lista de IPs está criptografada dentro do arquivo e não é visível sem a chave.",
  },
  "how.feat.device.title": {
    es: "Detección de dispositivo",
    en: "Device detection",
    pt: "Detecção de dispositivo",
  },
  "how.feat.device.desc": {
    es: "Zefer analiza RAM, CPU, GPU y plataforma de tu dispositivo para calcular dinámicamente el límite máximo de archivo al 80% de la capacidad disponible.",
    en: "Zefer analyzes your device's RAM, CPU, GPU, and platform to dynamically calculate the maximum file limit at 80% of available capacity.",
    pt: "O Zefer analisa RAM, CPU, GPU e plataforma do seu dispositivo para calcular dinamicamente o limite máximo de arquivo a 80% da capacidade disponível.",
  },
  "how.feat.keygen.title": {
    es: "Generador de claves seguras",
    en: "Secure key generator",
    pt: "Gerador de chaves seguras",
  },
  "how.feat.keygen.desc": {
    es: "Genera claves aleatorias de 64 a 1024 caracteres con soporte Unicode (latín, árabe, japonés, chino, coreano, griego, cirílico, emojis), alfanumérico, hexadecimal o UUID v7.",
    en: "Generate random keys from 64 to 1,024 characters with Unicode support (Latin, Arabic, Japanese, Chinese, Korean, Greek, Cyrillic, emojis), alphanumeric, hexadecimal, or UUID v7.",
    pt: "Gere chaves aleatórias de 64 a 1.024 caracteres com suporte Unicode (latim, árabe, japonês, chinês, coreano, grego, cirílico, emojis), alfanumérico, hexadecimal ou UUID v7.",
  },
  "how.tech.compression": {
    es: "Compresión",
    en: "Compression",
    pt: "Compressão",
  },
  "how.tech.format": {
    es: "Formato de archivo",
    en: "File format",
    pt: "Formato de arquivo",
  },

  // ─── Privacy page ───
  "privacy.title": {
    es: "Privacidad y seguridad",
    en: "Privacy & Security",
    pt: "Privacidade e segurança",
  },
  "privacy.subtitle": {
    es: "¿Cómo protegemos tu información?",
    en: "How we protect your information",
    pt: "Como protegemos sua informação",
  },
  "privacy.intro": {
    es: "Zefer fue diseñado desde cero con un único principio: tu información es solo tuya. Todo el cifrado y descifrado ocurre exclusivamente en tu navegador. Ningún dato se envía, almacena ni procesa en nuestros servidores. Es matemáticamente imposible que nosotros, o cualquier tercero, acceda al contenido de tus archivos .zefer.",
    en: "Zefer was designed from scratch with a single principle: your information is yours alone. All encryption and decryption happens exclusively in your browser. No data is sent, stored, or processed on our servers. It is mathematically impossible for us, or any third party, to access the content of your .zefer files.",
    pt: "O Zefer foi projetado do zero com um único princípio: sua informação é somente sua. Toda a criptografia e descriptografia acontece exclusivamente no seu navegador. Nenhum dado é enviado, armazenado ou processado em nossos servidores. É matematicamente impossível que nós, ou qualquer terceiro, acessemos o conteúdo dos seus arquivos .zefer.",
  },
  "privacy.encryption.title": {
    es: "Cifrado AES-256-GCM",
    en: "AES-256-GCM Encryption",
    pt: "Criptografia AES-256-GCM",
  },
  "privacy.encryption.desc": {
    es: "Utilizamos AES-256-GCM (Advanced Encryption Standard con Galois/Counter Mode), el mismo estándar que emplean gobiernos y organizaciones militares. Con una clave de 256 bits, existen 2^256 combinaciones posibles, lo que hace que un ataque de fuerza bruta sea computacionalmente imposible.",
    en: "We use AES-256-GCM (Advanced Encryption Standard with Galois/Counter Mode), the same standard used by governments and military organizations. With a 256-bit key, there are 2^256 possible combinations, making a brute-force attack computationally impossible.",
    pt: "Utilizamos AES-256-GCM (Advanced Encryption Standard com Galois/Counter Mode), o mesmo padrão utilizado por governos e organizações militares. Com uma chave de 256 bits, existem 2^256 combinações possíveis, o que torna um ataque de força bruta computacionalmente impossível.",
  },
  "privacy.pbkdf2.title": {
    es: "Derivación de clave PBKDF2",
    en: "PBKDF2 Key Derivation",
    pt: "Derivação de chave PBKDF2",
  },
  "privacy.pbkdf2.desc": {
    es: "Tu frase clave no se usa directamente como clave de cifrado. Se procesa con PBKDF2-SHA256 usando 600.000 iteraciones y un salt aleatorio y único de 32 bytes. Incluso frases clave simples generan claves criptográficamente fuertes.",
    en: "Your passphrase is not used directly as the encryption key. It's processed through PBKDF2-SHA256 with 600,000 iterations and a unique random 32-byte salt. Even simple passphrases generate cryptographically strong keys.",
    pt: "Sua frase-chave não é usada diretamente como chave de criptografia. É processada por meio do PBKDF2-SHA256 com 600.000 iterações e um salt aleatório e único de 32 bytes. Mesmo frases-chave simples geram chaves criptograficamente fortes.",
  },
  "privacy.zeroknowledge.title": {
    es: "Sin servidor, sin rastros",
    en: "No server, no traces",
    pt: "Sem servidor, sem rastros",
  },
  "privacy.zeroknowledge.desc": {
    es: "Zefer es 100% del lado del cliente. No existe backend, base de datos ni API que almacene tus datos. El archivo .zefer se genera y descifra íntegramente en tu navegador. Ni siquiera nosotros podríamos acceder a tu información, porque nunca la recibimos.",
    en: "Zefer is 100% client-side. There is no backend, database, or API that stores your data. The .zefer file is generated and decrypted entirely in your browser. Not even we could access your information, because we never receive it.",
    pt: "O Zefer é 100% do lado do cliente. Não existe backend, banco de dados ou API que armazene seus dados. O arquivo .zefer é gerado e descriptografado inteiramente no seu navegador. Nem mesmo nós poderíamos acessar sua informação, porque nunca a recebemos.",
  },
  "privacy.fileformat.title": {
    es: "Formato de archivo .zefer",
    en: ".zefer file format",
    pt: "Formato de arquivo .zefer",
  },
  "privacy.fileformat.desc": {
    es: "Los archivos .zefer contienen un header público mínimo (iteraciones, compresión, pista y nota opcionales) y un bloque cifrado que incluye el contenido, los metadatos de seguridad, la expiración, la pregunta secreta y la lista de IPs. Toda la información sensible está dentro del bloque cifrado con AES-256-GCM y es completamente invisible sin la clave.",
    en: "The .zefer files contain a minimal public header (iterations, compression, optional hint and note) and an encrypted block that includes the content, security metadata, expiration, secret question, and IP list. All sensitive information is inside the AES-256-GCM encrypted block and is completely invisible without the key.",
    pt: "Os arquivos .zefer contêm um header público mínimo (iterações, compressão, dica e nota opcionais) e um bloco criptografado que inclui o conteúdo, os metadados de segurança, a expiração, a pergunta secreta, a lista de IPs e o modo estrito. Toda a informação sensível está dentro do bloco criptografado com AES-256-GCM e é completamente invisível sem a chave.",
  },
  "privacy.ip.title": {
    es: "Restricción por dirección IP",
    en: "IP address restriction",
    pt: "Restrição por endereço IP",
  },
  "privacy.ip.desc": {
    es: "Opcionalmente, puedes restringir el descifrado a direcciones IP específicas (IPv4 e IPv6). La lista de IPs permitidas se almacena cifrada dentro del archivo .zefer, por lo que un atacante no puede ver qué IPs están autorizadas sin la frase clave. La verificación se realiza consultando la IP pública del cliente al momento de descifrar.",
    en: "Optionally, you can restrict decryption to specific IP addresses (IPv4 and IPv6). The list of allowed IPs is stored encrypted inside the .zefer file, so an attacker cannot see which IPs are authorized without the passphrase. Verification is done by checking the client's public IP at the time of decryption.",
    pt: "Opcionalmente, você pode restringir a descriptografia a endereços IP específicos (IPv4 e IPv6). A lista de IPs permitidos é armazenada criptografada dentro do arquivo .zefer, de modo que um atacante não pode ver quais IPs estão autorizados sem a frase-chave. A verificação é feita consultando o IP público do cliente no momento da descriptografia.",
  },
  "privacy.burn.title": {
    es: "Expiración integrada",
    en: "Built-in expiration",
    pt: "Expiração integrada",
  },
  "privacy.burn.desc": {
    es: "La fecha de expiración se cifra dentro del archivo .zefer junto con el contenido. Esto significa que no puede ser alterada sin la clave correcta. Si el archivo expiró, el descifrado se rechaza automáticamente, incluso si la frase clave es correcta.",
    en: "The expiration date is encrypted inside the .zefer file along with the content. This means it cannot be tampered with without the correct key. If the file has expired, decryption is automatically rejected, even if the passphrase is correct.",
    pt: "A data de expiração é criptografada dentro do arquivo .zefer junto com o conteúdo. Isso significa que não pode ser alterada sem a chave correta. Se o arquivo expirou, a descriptografia é rejeitada automaticamente, mesmo que a frase-chave esteja correta.",
  },
  "privacy.expiration.title": {
    es: "Opciones de expiración",
    en: "Expiration options",
    pt: "Opções de expiração",
  },
  "privacy.expiration.desc": {
    es: "Puedes elegir que tu archivo .zefer expire en 30 minutos, 1 hora, 24 horas, 7 días o 2 semanas. También puedes crear archivos sin expiración. Una vez expirado, el contenido es irrecuperable.",
    en: "You can choose for your .zefer file to expire in 30 minutes, 1 hour, 24 hours, 7 days, or 2 weeks. You can also create files with no expiration. Once expired, the content is unrecoverable.",
    pt: "Você pode escolher que seu arquivo .zefer expire em 30 minutos, 1 hora, 24 horas, 7 dias ou 2 semanas. Também é possível criar arquivos sem expiração. Após expirar, o conteúdo é irrecuperável.",
  },
  "privacy.metadata.title": {
    es: "Sin metadatos de rastreo",
    en: "No tracking metadata",
    pt: "Sem metadados de rastreamento",
  },
  "privacy.metadata.desc": {
    es: "No almacenamos direcciones IP, agentes de usuario, marcas de tiempo ni ningún dato de navegación. Zefer no tiene analíticas, cookies ni rastreadores. Tu visita a esta página es completamente anónima.",
    en: "We do not store IP addresses, user agents, timestamps, or any browsing data. Zefer has no analytics, cookies, or trackers. Your visit to this page is completely anonymous.",
    pt: "Não armazenamos endereços IP, agentes de usuário, marcas de tempo nem qualquer dado de navegação. O Zefer não tem analíticas, cookies nem rastreadores. Sua visita a esta página é completamente anônima.",
  },
  "privacy.clientside.title": {
    es: "Cifrado del lado del cliente",
    en: "Client-side encryption",
    pt: "Criptografia do lado do cliente",
  },
  "privacy.clientside.desc": {
    es: "Utilizamos la Web Crypto API nativa del navegador, que proporciona implementaciones criptográficas verificadas y optimizadas por hardware. No dependemos de bibliotecas de terceros, lo que elimina riesgos en la cadena de suministro.",
    en: "We use the browser's native Web Crypto API, which provides hardware-optimized and verified cryptographic implementations. We do not rely on third-party libraries, eliminating supply chain risks.",
    pt: "Utilizamos a Web Crypto API nativa do navegador, que fornece implementações criptográficas verificadas e otimizadas por hardware. Não dependemos de bibliotecas de terceiros, o que elimina riscos na cadeia de suprimentos.",
  },
  "privacy.whatwestore.title": {
    es: "Lo que almacenamos vs. lo que NO almacenamos",
    en: "What we store vs. what we DON'T store",
    pt: "O que armazenamos vs. o que NÃO armazenamos",
  },
  "privacy.store.yes": {
    es: "Almacenamos",
    en: "We store",
    pt: "Armazenamos",
  },
  "privacy.store.no": {
    es: "NUNCA almacenamos",
    en: "We NEVER store",
    pt: "NUNCA armazenamos",
  },
  "privacy.store.yes.items": {
    es: "Nada. Absolutamente nada. Zefer no tiene servidor ni base de datos.",
    en: "Nothing. Absolutely nothing. Zefer has no server or database.",
    pt: "Nada. Absolutamente nada. O Zefer não tem servidor nem banco de dados.",
  },
  "privacy.store.no.items": {
    es: "Contenido en texto plano|Frase clave / contraseña|Dirección IP|Agente de usuario / navegador|Cookies o rastreadores|Analíticas de uso",
    en: "Plaintext content|Passphrase / password|IP address|User agent / browser|Cookies or trackers|Usage analytics",
    pt: "Conteúdo em texto simples|Frase-chave / senha|Endereço IP|Agente de usuário / navegador|Cookies ou rastreadores|Analíticas de uso",
  },
  "privacy.gdpr.title": {
    es: "Cumplimiento normativo (RGPD, CCPA, LGPD)",
    en: "Regulatory compliance (GDPR, CCPA, LGPD)",
    pt: "Conformidade regulatória (RGPD, CCPA, LGPD)",
  },
  "privacy.gdpr.desc": {
    es: "Zefer cumple con las principales normativas internacionales de protección de datos: el RGPD de la Unión Europea, la CCPA de California (EE. UU.) y la LGPD de Brasil. Dado que Zefer no recopila, procesa ni almacena datos personales de ningún tipo, cumple inherentemente con los principios de minimización de datos y privacidad por diseño establecidos en estas regulaciones. No se utilizan cookies, rastreadores ni analíticas. Para más detalles, consulta nuestros términos y condiciones.",
    en: "Zefer complies with the major international data protection regulations: the EU's GDPR, California's CCPA, and Brazil's LGPD. Since Zefer does not collect, process, or store personal data of any kind, it inherently complies with the principles of data minimization and privacy by design established in these regulations. No cookies, trackers, or analytics are used. For more details, see our terms and conditions.",
    pt: "O Zefer cumpre as principais regulamentações internacionais de proteção de dados: o RGPD da União Europeia, a CCPA da Califórnia (EUA) e a LGPD do Brasil. Como o Zefer não coleta, processa nem armazena dados pessoais de qualquer tipo, cumpre inerentemente os princípios de minimização de dados e privacidade por design estabelecidos nessas regulamentações. Não são utilizados cookies, rastreadores nem analíticas. Para mais detalhes, consulte nossos termos e condições.",
  },
  "privacy.legal.title": {
    es: "Marco legal",
    en: "Legal framework",
    pt: "Marco legal",
  },
  "privacy.legal.desc": {
    es: "Zefer es un proyecto de código abierto que proporciona una herramienta de cifrado del lado del cliente. No recopilamos, almacenamos ni procesamos datos personales. Al usar Zefer, aceptas nuestros términos de servicio y condiciones de uso.",
    en: "Zefer is an open-source project that provides a client-side encryption tool. We do not collect, store, or process personal data. By using Zefer, you accept our terms of service and conditions of use.",
    pt: "O Zefer é um projeto de código aberto que fornece uma ferramenta de criptografia do lado do cliente. Não coletamos, armazenamos nem processamos dados pessoais. Ao usar o Zefer, você aceita nossos termos de serviço e condições de uso.",
  },
  "privacy.legal.terms": {
    es: "Ver términos y condiciones",
    en: "View terms and conditions",
    pt: "Ver termos e condições",
  },
  "privacy.back": {
    es: "Volver al inicio",
    en: "Back to home",
    pt: "Voltar ao início",
  },

  // ─── Terms & Conditions ───
  "terms.badge": {
    es: "TÉRMINOS LEGALES",
    en: "LEGAL TERMS",
    pt: "TERMOS LEGAIS",
  },
  "terms.title": {
    es: "Términos y condiciones",
    en: "Terms & Conditions",
    pt: "Termos e condições",
  },
  "terms.subtitle": {
    es: "Condiciones de uso de la plataforma Zefer",
    en: "Conditions of use for the Zefer platform",
    pt: "Condições de uso da plataforma Zefer",
  },
  "terms.intro": {
    es: "Al utilizar Zefer, aceptas los siguientes términos y condiciones. Zefer es una herramienta de cifrado de código abierto que opera completamente en tu navegador. Estos términos regulan tu uso del servicio y establecen los límites de nuestra responsabilidad.",
    en: "By using Zefer, you accept the following terms and conditions. Zefer is an open-source encryption tool that operates entirely in your browser. These terms govern your use of the service and establish the limits of our liability.",
    pt: "Ao usar o Zefer, você aceita os seguintes termos e condições. O Zefer é uma ferramenta de criptografia de código aberto que opera inteiramente no seu navegador. Estes termos regulam seu uso do serviço e estabelecem os limites de nossa responsabilidade.",
  },
  "terms.service.title": {
    es: "Descripción del servicio",
    en: "Service description",
    pt: "Descrição do serviço",
  },
  "terms.service.desc": {
    es: "Zefer proporciona una herramienta de cifrado del lado del cliente que permite a los usuarios cifrar texto y archivos en formato .zefer utilizando AES-256-GCM. Todo el procesamiento criptográfico ocurre en el navegador del usuario. Zefer no transmite, almacena ni procesa ningún dato del usuario en servidores externos, salvo la consulta de la IP pública del cliente cuando se utiliza la restricción por IP.",
    en: "Zefer provides a client-side encryption tool that allows users to encrypt text and files into .zefer format using AES-256-GCM. All cryptographic processing occurs in the user's browser. Zefer does not transmit, store, or process any user data on external servers, except for the client's public IP lookup when IP restriction is used.",
    pt: "O Zefer fornece uma ferramenta de criptografia do lado do cliente que permite aos usuários criptografar texto e arquivos no formato .zefer usando AES-256-GCM. Todo o processamento criptográfico ocorre no navegador do usuário. O Zefer não transmite, armazena nem processa nenhum dado do usuário em servidores externos, exceto a consulta do IP público do cliente quando a restrição por IP é utilizada.",
  },
  "terms.security.title": {
    es: "Responsabilidad sobre la seguridad",
    en: "Security responsibility",
    pt: "Responsabilidade sobre a segurança",
  },
  "terms.security.desc": {
    es: "Zefer utiliza algoritmos criptográficos de grado militar (AES-256-GCM, PBKDF2-SHA256) implementados a través de la Web Crypto API del navegador. Sin embargo, la seguridad de tus archivos cifrados depende directamente de la fortaleza de la frase clave que elijas. Zefer no es responsable de la pérdida de acceso a archivos cifrados debido a frases clave olvidadas, archivos expirados o configuraciones de seguridad incorrectas. No existe ningún mecanismo de recuperación.",
    en: "Zefer uses military-grade cryptographic algorithms (AES-256-GCM, PBKDF2-SHA256) implemented through the browser's Web Crypto API. However, the security of your encrypted files depends directly on the strength of the passphrase you choose. Zefer is not responsible for loss of access to encrypted files due to forgotten passphrases, expired files, or incorrect security configurations. There is no recovery mechanism.",
    pt: "O Zefer utiliza algoritmos criptográficos de nível militar (AES-256-GCM, PBKDF2-SHA256) implementados através da Web Crypto API do navegador. No entanto, a segurança dos seus arquivos criptografados depende diretamente da força da frase-chave que você escolher. O Zefer não é responsável pela perda de acesso a arquivos criptografados devido a frases-chave esquecidas, arquivos expirados ou configurações de segurança incorretas. Não existe nenhum mecanismo de recuperação.",
  },
  "terms.liability.title": {
    es: "Limitación de responsabilidad",
    en: "Limitation of liability",
    pt: "Limitação de responsabilidade",
  },
  "terms.liability.desc": {
    es: "Zefer se proporciona «tal cual» y «según disponibilidad», sin garantías de ningún tipo, expresas o implícitas. En ningún caso los creadores o contribuidores de Zefer serán responsables de daños directos, indirectos, incidentales, especiales o consecuentes que surjan del uso o la imposibilidad de uso del servicio, incluyendo pero sin limitarse a la pérdida de datos, la interrupción del negocio o la pérdida de beneficios.",
    en: "Zefer is provided 'as is' and 'as available', without warranties of any kind, express or implied. In no event shall the creators or contributors of Zefer be liable for any direct, indirect, incidental, special, or consequential damages arising out of the use or inability to use the service, including but not limited to loss of data, business interruption, or loss of profits.",
    pt: "O Zefer é fornecido «como está» e «conforme disponibilidade», sem garantias de qualquer tipo, expressas ou implícitas. Em nenhum caso os criadores ou contribuidores do Zefer serão responsáveis por danos diretos, indiretos, incidentais, especiais ou consequentes decorrentes do uso ou da impossibilidade de uso do serviço, incluindo, mas não se limitando a, perda de dados, interrupção de negócios ou perda de lucros.",
  },
  "terms.use.title": {
    es: "Uso aceptable",
    en: "Acceptable use",
    pt: "Uso aceitável",
  },
  "terms.use.desc": {
    es: "Zefer está diseñado para el intercambio seguro de información sensible legítima, como contraseñas, claves de API, configuraciones y documentos confidenciales. Queda prohibido utilizar Zefer para cifrar, distribuir o almacenar contenido ilegal, malware, material que viole derechos de propiedad intelectual, o cualquier contenido que infrinja las leyes aplicables en tu jurisdicción.",
    en: "Zefer is designed for the secure exchange of legitimate sensitive information, such as passwords, API keys, configurations, and confidential documents. It is prohibited to use Zefer to encrypt, distribute, or store illegal content, malware, material that violates intellectual property rights, or any content that infringes applicable laws in your jurisdiction.",
    pt: "O Zefer é projetado para a troca segura de informações sensíveis legítimas, como senhas, chaves de API, configurações e documentos confidenciais. É proibido usar o Zefer para criptografar, distribuir ou armazenar conteúdo ilegal, malware, material que viole direitos de propriedade intelectual ou qualquer conteúdo que infrinja as leis aplicáveis em sua jurisdição.",
  },
  "terms.ip.title": {
    es: "Propiedad intelectual",
    en: "Intellectual property",
    pt: "Propriedade intelectual",
  },
  "terms.ip.desc": {
    es: "Zefer es un proyecto de código abierto. El código fuente está disponible bajo los términos de su licencia respectiva. Los usuarios conservan la propiedad total de su contenido cifrado. Zefer no reclama ningún derecho sobre los datos que los usuarios cifran o descifran a través de la plataforma.",
    en: "Zefer is an open-source project. The source code is available under the terms of its respective license. Users retain full ownership of their encrypted content. Zefer does not claim any rights over the data that users encrypt or decrypt through the platform.",
    pt: "O Zefer é um projeto de código aberto. O código-fonte está disponível sob os termos de sua respectiva licença. Os usuários mantêm a propriedade total de seu conteúdo criptografado. O Zefer não reivindica nenhum direito sobre os dados que os usuários criptografam ou descriptografam através da plataforma.",
  },
  "terms.gdpr.title": {
    es: "Cumplimiento del RGPD (Unión Europea)",
    en: "GDPR Compliance (European Union)",
    pt: "Conformidade com o RGPD (União Europeia)",
  },
  "terms.gdpr.desc": {
    es: "Zefer cumple con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea. Dado que Zefer no recopila, procesa ni almacena datos personales, no se requiere base legal para el tratamiento de datos conforme a los artículos 6 y 7 del RGPD. No se utilizan cookies, rastreadores ni analíticas. No se realizan transferencias internacionales de datos. En cumplimiento de los artículos 13 y 14 del RGPD, informamos que el responsable del tratamiento es José Carrillo (GitHub: @carrilloapps). No se designa un Delegado de Protección de Datos (DPO) dado que no se procesan datos personales.",
    en: "Zefer complies with the General Data Protection Regulation (GDPR) of the European Union. Since Zefer does not collect, process, or store personal data, no legal basis for data processing is required under Articles 6 and 7 of the GDPR. No cookies, trackers, or analytics are used. No international data transfers are made. In compliance with Articles 13 and 14 of the GDPR, we inform that the data controller is José Carrillo (GitHub: @carrilloapps). No Data Protection Officer (DPO) is designated since no personal data is processed.",
    pt: "O Zefer cumpre o Regulamento Geral de Proteção de Dados (RGPD) da União Europeia. Como o Zefer não coleta, processa nem armazena dados pessoais, não é necessária base legal para o tratamento de dados conforme os artigos 6 e 7 do RGPD. Não são utilizados cookies, rastreadores nem analíticas. Não são realizadas transferências internacionais de dados. Em conformidade com os artigos 13 e 14 do RGPD, informamos que o responsável pelo tratamento é José Carrillo (GitHub: @carrilloapps). Não é designado um Encarregado de Proteção de Dados (DPO), pois não são processados dados pessoais.",
  },
  "terms.ccpa.title": {
    es: "Cumplimiento de la CCPA (California, EE. UU.)",
    en: "CCPA Compliance (California, USA)",
    pt: "Conformidade com a CCPA (Califórnia, EUA)",
  },
  "terms.ccpa.desc": {
    es: "Zefer cumple con la Ley de Privacidad del Consumidor de California (CCPA). No vendemos, compartimos ni divulgamos información personal de los usuarios. No recopilamos categorías de información personal según la definición de la CCPA. Los residentes de California tienen derecho a solicitar información sobre la recopilación de datos; dado que Zefer no recopila datos, no hay información que divulgar.",
    en: "Zefer complies with the California Consumer Privacy Act (CCPA). We do not sell, share, or disclose personal information of users. We do not collect categories of personal information as defined by the CCPA. California residents have the right to request information about data collection; since Zefer does not collect data, there is no information to disclose.",
    pt: "O Zefer cumpre a Lei de Privacidade do Consumidor da Califórnia (CCPA). Não vendemos, compartilhamos nem divulgamos informações pessoais dos usuários. Não coletamos categorias de informações pessoais conforme definido pela CCPA. Os residentes da Califórnia têm o direito de solicitar informações sobre a coleta de dados; como o Zefer não coleta dados, não há informações a divulgar.",
  },
  "terms.lgpd.title": {
    es: "Cumplimiento de la LGPD (Brasil)",
    en: "LGPD Compliance (Brazil)",
    pt: "Conformidade com a LGPD (Brasil)",
  },
  "terms.lgpd.desc": {
    es: "Zefer cumple con la Ley General de Protección de Datos (LGPD) de Brasil. No se realiza tratamiento de datos personales. No se recopilan datos sensibles según la definición del artículo 5 de la LGPD. Los titulares de datos en Brasil pueden ejercer sus derechos conforme al artículo 18 de la LGPD a través de https://github.com/carrilloapps.",
    en: "Zefer complies with Brazil's General Data Protection Law (LGPD). No processing of personal data takes place. No sensitive data is collected as defined by Article 5 of the LGPD. Data subjects in Brazil may exercise their rights under Article 18 of the LGPD through https://github.com/carrilloapps.",
    pt: "O Zefer cumpre a Lei Geral de Proteção de Dados (LGPD) do Brasil. Não é realizado tratamento de dados pessoais. Não são coletados dados sensíveis conforme definido pelo artigo 5 da LGPD. Os titulares de dados no Brasil podem exercer seus direitos conforme o artigo 18 da LGPD através de https://github.com/carrilloapps.",
  },
  "terms.colombia.title": {
    es: "Cumplimiento de la Ley 1581 (Colombia)",
    en: "Law 1581 Compliance (Colombia)",
    pt: "Conformidade com a Lei 1581 (Colômbia)",
  },
  "terms.colombia.desc": {
    es: "Zefer cumple con la Ley Estatutaria 1581 de 2012 de la República de Colombia y su Decreto Reglamentario 1377 de 2013, que regulan la protección de datos personales. Dado que Zefer no recopila, almacena ni trata datos personales en ningún momento, no se requiere autorización del titular conforme al artículo 9 de la Ley 1581, ni registro ante la Superintendencia de Industria y Comercio (SIC). Zefer opera bajo el principio de minimización de datos contemplado en el literal d) del artículo 4 de dicha ley. Para consultas, el responsable del tratamiento es José Carrillo (https://github.com/carrilloapps).",
    en: "Zefer complies with Statutory Law 1581 of 2012 of the Republic of Colombia and its Regulatory Decree 1377 of 2013, which govern the protection of personal data. Since Zefer does not collect, store, or process personal data at any time, no authorization from the data subject is required under Article 9 of Law 1581, nor registration with the Superintendence of Industry and Commerce (SIC). Zefer operates under the principle of data minimization contemplated in paragraph d) of Article 4 of said law. For inquiries, the data controller is José Carrillo (https://github.com/carrilloapps).",
    pt: "O Zefer cumpre a Lei Estatutária 1581 de 2012 da República da Colômbia e seu Decreto Regulamentário 1377 de 2013, que regulam a proteção de dados pessoais. Como o Zefer não coleta, armazena nem trata dados pessoais em nenhum momento, não é necessária autorização do titular conforme o artigo 9 da Lei 1581, nem registro perante a Superintendência de Indústria e Comércio (SIC). O Zefer opera sob o princípio de minimização de dados contemplado na alínea d) do artigo 4 da referida lei. Para consultas, o responsável pelo tratamento é José Carrillo (https://github.com/carrilloapps).",
  },
  "terms.license.title": {
    es: "Licencia MIT",
    en: "MIT License",
    pt: "Licença MIT",
  },
  "terms.license.desc": {
    es: "Zefer es software de código abierto distribuido bajo la Licencia MIT. Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia de este software, para utilizar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software, bajo las condiciones de que se incluya el aviso de copyright y el aviso de permiso en todas las copias. El software se proporciona «tal cual», sin garantía de ningún tipo. El texto completo de la licencia está disponible en el repositorio del proyecto.",
    en: "Zefer is open-source software distributed under the MIT License. Permission is hereby granted, free of charge, to any person obtaining a copy of this software, to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the condition that the copyright notice and permission notice be included in all copies. The software is provided 'as is', without warranty of any kind. The full license text is available in the project repository.",
    pt: "O Zefer é software de código aberto distribuído sob a Licença MIT. É concedida permissão, gratuitamente, a qualquer pessoa que obtenha uma cópia deste software, para usar, copiar, modificar, mesclar, publicar, distribuir, sublicenciar e/ou vender cópias do software, sob a condição de que o aviso de copyright e o aviso de permissão sejam incluídos em todas as cópias. O software é fornecido «como está», sem garantia de qualquer tipo. O texto completo da licença está disponível no repositório do projeto.",
  },
  "terms.creator.title": {
    es: "Atribución y creador",
    en: "Attribution and creator",
    pt: "Atribuição e criador",
  },
  "terms.creator.desc": {
    es: "Zefer fue creado y es mantenido por José Carrillo (https://carrillo.app), desarrollador senior fullstack y Tech Lead con más de 10 años de experiencia. GitHub: @carrilloapps. Al utilizar Zefer, reconoces que este proyecto es una contribución al ecosistema de código abierto bajo los términos de la Licencia MIT.",
    en: "Zefer was created and is maintained by José Carrillo (https://carrillo.app), a senior fullstack developer and Tech Lead with over 10 years of experience. GitHub: @carrilloapps. By using Zefer, you acknowledge that this project is a contribution to the open-source ecosystem under the terms of the MIT License.",
    pt: "O Zefer foi criado e é mantido por José Carrillo (https://carrillo.app), desenvolvedor senior fullstack e Tech Lead com mais de 10 anos de experiência. GitHub: @carrilloapps. Ao usar o Zefer, você reconhece que este projeto é uma contribuição ao ecossistema de código aberto sob os termos da Licença MIT.",
  },
  "terms.changes.title": {
    es: "Modificaciones a los términos",
    en: "Changes to terms",
    pt: "Alterações nos termos",
  },
  // ─── Project page ───
  "project.title": {
    es: "Proyecto Zefer",
    en: "Zefer Project",
    pt: "Projeto Zefer",
  },
  "project.subtitle": {
    es: "Herramienta de cifrado de código abierto, 100% del lado del cliente. Licencia MIT.",
    en: "Open-source encryption tool, 100% client-side. MIT License.",
    pt: "Ferramenta de criptografia de código aberto, 100% do lado do cliente. Licença MIT.",
  },
  "project.repo.desc": {
    es: "Cifrado de extremo a extremo para texto y archivos. Sin servidores, sin rastros, sin cookies.",
    en: "End-to-end encryption for text and files. No servers, no traces, no cookies.",
    pt: "Criptografia ponta a ponta para texto e arquivos. Sem servidores, sem rastros, sem cookies.",
  },
  "project.about.title": {
    es: "Acerca del proyecto",
    en: "About the project",
    pt: "Sobre o projeto",
  },
  "project.about.desc": {
    es: "Zefer nació de la necesidad de compartir información sensible de forma segura sin depender de servicios de terceros. Todo el cifrado ocurre en el navegador del usuario utilizando la Web Crypto API. Los archivos .zefer son completamente autónomos: contienen el secreto cifrado con AES-256-GCM, metadatos de seguridad cifrados y una cabecera pública mínima. El proyecto es de código abierto bajo la licencia MIT y está diseñado para ser desplegado en cualquier plataforma de hosting estático.",
    en: "Zefer was born from the need to share sensitive information securely without relying on third-party services. All encryption happens in the user's browser using the Web Crypto API. The .zefer files are completely self-contained: they hold the secret encrypted with AES-256-GCM, encrypted security metadata, and a minimal public header. The project is open source under the MIT license and is designed to be deployed on any static hosting platform.",
    pt: "O Zefer nasceu da necessidade de compartilhar informações sensíveis de forma segura sem depender de serviços de terceiros. Toda a criptografia acontece no navegador do usuário usando a Web Crypto API. Os arquivos .zefer são completamente autônomos: contêm o segredo criptografado com AES-256-GCM, metadados de segurança criptografados e um cabeçalho público mínimo. O projeto é de código aberto sob a licença MIT e foi projetado para ser implantado em qualquer plataforma de hospedagem estática.",
  },
  "project.features.title": {
    es: "Características principales",
    en: "Key features",
    pt: "Recursos principais",
  },
  "project.feat.encryption": {
    es: "Cifrado AES-256-GCM con derivación de clave PBKDF2-SHA256 (300k a 1M de iteraciones). Todo ocurre en tu navegador.",
    en: "AES-256-GCM encryption with PBKDF2-SHA256 key derivation (300k to 1M iterations). Everything happens in your browser.",
    pt: "Criptografia AES-256-GCM com derivação de chave PBKDF2-SHA256 (300k a 1M de iterações). Tudo acontece no seu navegador.",
  },
  "project.feat.format": {
    es: "Formato ZEFER3 con soporte para texto y cualquier tipo de archivo (imágenes, ZIPs, PDFs, etc.).",
    en: "ZEFER3 format supporting text and any file type (images, ZIPs, PDFs, etc.).",
    pt: "Formato ZEFER3 com suporte para texto e qualquer tipo de arquivo (imagens, ZIPs, PDFs, etc.).",
  },
  "project.feat.security": {
    es: "Doble frase clave, clave de revelado, pregunta secreta, restricción por IP, expiración y límite de intentos.",
    en: "Dual passphrase, reveal key, secret question, IP restriction, expiration, and attempt limit.",
    pt: "Dupla frase-chave, chave de revelação, pergunta secreta, restrição por IP, expiração e limite de tentativas.",
  },
  "project.feat.i18n": {
    es: "Disponible en español, inglés y portugués. Modo claro y oscuro con detección automática del sistema operativo.",
    en: "Available in Spanish, English, and Portuguese. Light and dark mode with automatic OS detection.",
    pt: "Disponível em espanhol, inglês e português. Modo claro e escuro com detecção automática do sistema operacional.",
  },
  "project.feat.device": {
    es: "Detección automática de RAM, CPU, GPU y plataforma para calcular dinámicamente el límite de archivo al 80% de la capacidad.",
    en: "Automatic detection of RAM, CPU, GPU, and platform to dynamically calculate the file limit at 80% of capacity.",
    pt: "Detecção automática de RAM, CPU, GPU e plataforma para calcular dinamicamente o limite de arquivo a 80% da capacidade.",
  },
  "project.feat.compliance": {
    es: "Cumplimiento total con RGPD (UE), CCPA (California), LGPD (Brasil) y Ley 1581 (Colombia). Sin cookies, sin rastreadores, sin analíticas.",
    en: "Full compliance with GDPR (EU), CCPA (California), LGPD (Brazil), and Law 1581 (Colombia). No cookies, no trackers, no analytics.",
    pt: "Conformidade total com RGPD (UE), CCPA (Califórnia), LGPD (Brasil) e Lei 1581 (Colômbia). Sem cookies, sem rastreadores, sem analíticas.",
  },
  "project.stack.title": {
    es: "Stack tecnológico",
    en: "Tech stack",
    pt: "Stack tecnológico",
  },
  "project.creator.title": {
    es: "Creador",
    en: "Creator",
    pt: "Criador",
  },
  "project.creator.desc": {
    es: "Desarrollador senior fullstack y Tech Lead con más de 10 años de experiencia. Especializado en Go, React, NestJS, React Native y arquitecturas en la nube.",
    en: "Senior fullstack developer and Tech Lead with over 10 years of experience. Specialized in Go, React, NestJS, React Native, and cloud architectures.",
    pt: "Desenvolvedor senior fullstack e Tech Lead com mais de 10 anos de experiência. Especializado em Go, React, NestJS, React Native e arquiteturas em nuvem.",
  },
  "project.creator.since": {
    es: "En GitHub desde",
    en: "On GitHub since",
    pt: "No GitHub desde",
  },
  "project.donate.title": {
    es: "Apoya el proyecto",
    en: "Support the project",
    pt: "Apoie o projeto",
  },
  "project.donate.desc": {
    es: "Zefer es gratuito y de código abierto. Si te resulta útil, considera hacer una donación para apoyar el desarrollo y mantenimiento del proyecto.",
    en: "Zefer is free and open source. If you find it useful, consider making a donation to support the development and maintenance of the project.",
    pt: "O Zefer é gratuito e de código aberto. Se você o considera útil, considere fazer uma doação para apoiar o desenvolvimento e a manutenção do projeto.",
  },

  // ─── 404 ───
  "notfound.title": {
    es: "Página no encontrada",
    en: "Page not found",
    pt: "Página não encontrada",
  },
  "notfound.desc": {
    es: "La página que buscas no existe o fue movida.",
    en: "The page you're looking for doesn't exist or has been moved.",
    pt: "A página que você procura não existe ou foi movida.",
  },

  // ─── Install ───
  "install.title": {
    es: "Instalar Zefer",
    en: "Install Zefer",
    pt: "Instalar o Zefer",
  },
  "install.desc": {
    es: "Aplicaciones nativas para todos los sistemas operativos. Próximamente.",
    en: "Native applications for all operating systems. Coming soon.",
    pt: "Aplicativos nativos para todos os sistemas operacionais. Em breve.",
  },
  "install.coming": {
    es: "Pronto",
    en: "Soon",
    pt: "Em breve",
  },
  "install.web.title": {
    es: "Disponible ahora en la web",
    en: "Available now on the web",
    pt: "Disponível agora na web",
  },
  "install.web.desc": {
    es: "Mientras las aplicaciones nativas están en desarrollo, puedes usar Zefer directamente desde tu navegador. Funciona en cualquier dispositivo.",
    en: "While native apps are in development, you can use Zefer directly from your browser. Works on any device.",
    pt: "Enquanto os aplicativos nativos estão em desenvolvimento, você pode usar o Zefer diretamente do seu navegador. Funciona em qualquer dispositivo.",
  },
  "install.web.cta": {
    es: "Abrir Zefer Web",
    en: "Open Zefer Web",
    pt: "Abrir Zefer Web",
  },
  "install.notify": {
    es: "Síguenos en GitHub para recibir notificaciones cuando las aplicaciones nativas estén disponibles.",
    en: "Follow us on GitHub to get notified when native apps are available.",
    pt: "Siga-nos no GitHub para ser notificado quando os aplicativos nativos estiverem disponíveis.",
  },

  "terms.changes.desc": {
    es: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en esta página. El uso continuado de Zefer después de la publicación de los cambios constituye la aceptación de los nuevos términos. Recomendamos revisar esta página periódicamente.",
    en: "We reserve the right to modify these terms at any time. Changes will take effect immediately upon publication on this page. Continued use of Zefer after publication of the changes constitutes acceptance of the new terms. We recommend reviewing this page periodically.",
    pt: "Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após sua publicação nesta página. O uso continuado do Zefer após a publicação das alterações constitui a aceitação dos novos termos. Recomendamos revisar esta página periodicamente.",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? translations[key]?.["en"] ?? key;
}
