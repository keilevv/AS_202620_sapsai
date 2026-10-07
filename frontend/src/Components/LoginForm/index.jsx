import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaGoogle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaSpinner,
  FaFileContract,
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import useAuth from "../../hooks/useAuth";
import { showNotification } from "../Common/Notification";
import useStore from "../../hooks/useStore";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Terms and Privacy Policy Content
const TermsAndPrivacyContent = {
  en: {
    terms: {
      title: "Terms of Service",
      content: `# TERMS OF SERVICE - SAPSAI

**Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}**

## 1. ACCEPTANCE OF TERMS

By accessing and using SAPSAI (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

## 2. DESCRIPTION OF SERVICE

SAPSAI is a plant leaf classification platform that uses artificial intelligence to identify and classify plant species. The Service allows users to upload images of plant leaves for classification and verification purposes.

## 3. USER ACCOUNT AND VERIFICATION

### 3.1 Account Registration
To use certain features of the Service, you must register for an account. You agree to:
- Provide accurate, current, and complete information during registration
- Maintain and promptly update your account information
- Maintain the security of your password
- Accept responsibility for all activities that occur under your account

### 3.2 Identity Verification
SAPSAI collects the following personal information to verify the authenticity of each user:
- Full name
- Email address
- Phone number
- Institution (optional)
- Department (optional)
- Location (optional)
- Professional biography (optional)

This information is required to ensure the integrity of the platform and prevent fraudulent use. By providing this information, you consent to its use for verification purposes in accordance with our Privacy Policy.

## 4. USER CONDUCT

You agree not to:
- Use the Service for any illegal purpose or in violation of any laws
- Upload false, misleading, or fraudulent information
- Attempt to gain unauthorized access to the Service or its related systems
- Interfere with or disrupt the Service or servers connected to the Service
- Use automated systems to access the Service without permission

## 5. INTELLECTUAL PROPERTY

All content, features, and functionality of the Service are owned by SAPSAI and are protected by international copyright, trademark, and other intellectual property laws.

## 6. USER-GENERATED CONTENT

By uploading images or other content to the Service, you grant SAPSAI a non-exclusive, royalty-free license to use, store, and process such content for the purpose of providing the Service and improving our classification algorithms.

## 7. DISCLAIMER OF WARRANTIES

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

## 8. LIMITATION OF LIABILITY

SAPSAI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.

## 9. MODIFICATIONS TO SERVICE

SAPSAI reserves the right to modify or discontinue the Service at any time without prior notice.

## 10. TERMINATION

SAPSAI may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that SAPSAI believes violates these Terms of Service.

## 11. GOVERNING LAW

These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Colombia, without regard to its conflict of law provisions.

## 12. CONTACT INFORMATION

For questions about these Terms of Service, please contact us through the Service's contact channels.`,
    },
    privacy: {
      title: "Privacy Policy",
      content: `# PRIVACY POLICY - SAPSAI

**Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}**

## 1. INTRODUCTION

SAPSAI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service, in compliance with Colombian Law 1581 of 2012 (Law on Protection of Personal Data) and its regulatory decree 1377 of 2013.

## 2. DATA CONTROLLER

**Responsible Party (Responsable del Tratamiento):**
SAPSAI
[Your Company Address]
[Your Contact Email]
[Your Contact Phone]

## 3. INFORMATION WE COLLECT

### 3.1 Personal Information for Account Registration and Verification
To verify the authenticity of each user and provide our services, we collect:
- **Full Name** (Required)
- **Email Address** (Required)
- **Phone Number** (Required)
- **Password** (Required, stored as encrypted hash)
- **Institution** (Optional)
- **Department** (Optional)
- **Location** (Optional)
- **Professional Biography** (Optional)
- **Google Account Information** (If using Google OAuth: email, name, Google ID)

### 3.2 Usage Information
- Images uploaded for classification
- Classification results and metadata
- Usage patterns and preferences
- Device information and IP addresses
- Cookies and similar tracking technologies

## 4. PURPOSE OF DATA PROCESSING

We process your personal data for the following purposes:
1. **User Verification**: To verify the authenticity and identity of users
2. **Service Provision**: To provide plant classification services
3. **Account Management**: To manage your account and preferences
4. **Communication**: To send service-related notifications (if enabled)
5. **Service Improvement**: To improve our AI models and service quality
6. **Legal Compliance**: To comply with applicable laws and regulations

## 5. LEGAL BASIS FOR PROCESSING

Under Colombian Law 1581 of 2012, we process your personal data based on:
- **Your explicit consent** (Article 4, Law 1581/2012)
- **Contractual necessity** for providing the requested services
- **Legitimate interest** in improving our services and preventing fraud

## 6. DATA RETENTION

We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal data, except where we are required to retain it for legal compliance.

## 7. DATA SHARING AND DISCLOSURE

We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
- **Service Providers**: With trusted third-party service providers who assist in operating our Service (e.g., cloud storage, email services)
- **Legal Requirements**: When required by law or to respond to legal process
- **Business Transfers**: In connection with any merger, sale, or transfer of assets

## 8. YOUR RIGHTS UNDER COLOMBIAN LAW

In accordance with Law 1581 of 2012, you have the following rights:
1. **Right to Know, Update, and Rectify** (Article 8): Access, update, and correct your personal data
2. **Right to Request Proof of Authorization** (Article 8): Request evidence of your consent
3. **Right to Revoke Authorization** (Article 8): Withdraw your consent at any time
4. **Right to Request Deletion** (Article 8): Request deletion of your data when processing does not respect constitutional and legal principles
5. **Right to Access Free of Charge** (Article 8): Access your data without charge
6. **Right to File Complaints** (Article 15): File complaints with the Superintendency of Industry and Commerce (SIC) regarding violations of data protection laws

## 9. DATA SECURITY

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.

## 10. COOKIES AND TRACKING TECHNOLOGIES

We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts. You can control cookies through your browser settings.

## 11. INTERNATIONAL DATA TRANSFERS

If your data is transferred outside Colombia, we ensure appropriate safeguards are in place in accordance with Colombian data protection regulations.

## 12. CHILDREN'S PRIVACY

Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.

## 13. CHANGES TO THIS PRIVACY POLICY

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

## 14. CONTACT US

To exercise your rights or for questions about this Privacy Policy, please contact us:
- **Email**: [Your Contact Email]
- **Address**: [Your Company Address]
- **Phone**: [Your Contact Phone]

You may also file complaints with the Superintendency of Industry and Commerce (SIC) of Colombia at: www.sic.gov.co`,
    },
  },
  es: {
    terms: {
      title: "Términos de Servicio",
      content: `# TÉRMINOS DE SERVICIO - SAPSAI

**Última Actualización: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}**

## 1. ACEPTACIÓN DE TÉRMINOS

Al acceder y utilizar SAPSAI (el "Servicio"), usted acepta y se compromete a cumplir con los términos y disposiciones de este acuerdo. Si no está de acuerdo con lo anterior, por favor no utilice este servicio.

## 2. DESCRIPCIÓN DEL SERVICIO

SAPSAI es una plataforma de clasificación de hojas de plantas que utiliza inteligencia artificial para identificar y clasificar especies vegetales. El Servicio permite a los usuarios subir imágenes de hojas de plantas para su clasificación y verificación.

## 3. CUENTA DE USUARIO Y VERIFICACIÓN

### 3.1 Registro de Cuenta
Para utilizar ciertas funciones del Servicio, debe registrarse para una cuenta. Usted acepta:
- Proporcionar información precisa, actual y completa durante el registro
- Mantener y actualizar oportunamente la información de su cuenta
- Mantener la seguridad de su contraseña
- Aceptar la responsabilidad por todas las actividades que ocurran bajo su cuenta

### 3.2 Verificación de Identidad
SAPSAI recopila la siguiente información personal para verificar la autenticidad de cada usuario:
- Nombre completo
- Dirección de correo electrónico
- Número de teléfono
- Institución (opcional)
- Departamento (opcional)
- Ubicación (opcional)
- Biografía profesional (opcional)

Esta información es necesaria para garantizar la integridad de la plataforma y prevenir el uso fraudulento. Al proporcionar esta información, usted consiente su uso para fines de verificación de acuerdo con nuestra Política de Privacidad.

## 4. CONDUCTA DEL USUARIO

Usted acepta no:
- Utilizar el Servicio para ningún propósito ilegal o en violación de cualquier ley
- Subir información falsa, engañosa o fraudulenta
- Intentar obtener acceso no autorizado al Servicio o sus sistemas relacionados
- Interferir o interrumpir el Servicio o los servidores conectados al Servicio
- Utilizar sistemas automatizados para acceder al Servicio sin permiso

## 5. PROPIEDAD INTELECTUAL

Todo el contenido, características y funcionalidad del Servicio son propiedad de SAPSAI y están protegidos por leyes internacionales de derechos de autor, marcas registradas y otras leyes de propiedad intelectual.

## 6. CONTENIDO GENERADO POR EL USUARIO

Al subir imágenes u otro contenido al Servicio, usted otorga a SAPSAI una licencia no exclusiva y libre de regalías para usar, almacenar y procesar dicho contenido con el propósito de proporcionar el Servicio y mejorar nuestros algoritmos de clasificación.

## 7. RENUNCIA DE GARANTÍAS

EL SERVICIO SE PROPORCIONA "TAL CUAL" Y "SEGÚN DISPONIBILIDAD" SIN GARANTÍAS DE NINGÚN TIPO, YA SEA EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS IMPLÍCITAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO PARTICULAR O NO INFRACCIÓN.

## 8. LIMITACIÓN DE RESPONSABILIDAD

SAPSAI NO SERÁ RESPONSABLE POR CUALQUIER DAÑO INDIRECTO, INCIDENTAL, ESPECIAL, CONSECUENTE O PUNITIVO RESULTANTE DE SU USO O INCAPACIDAD DE USAR EL SERVICIO.

## 9. MODIFICACIONES AL SERVICIO

SAPSAI se reserva el derecho de modificar o discontinuar el Servicio en cualquier momento sin previo aviso.

## 10. TERMINACIÓN

SAPSAI puede terminar o suspender su cuenta y el acceso al Servicio inmediatamente, sin previo aviso, por conducta que SAPSAI considere que viola estos Términos de Servicio.

## 11. LEY APLICABLE

Estos Términos de Servicio se regirán e interpretarán de acuerdo con las leyes de la República de Colombia, sin tener en cuenta sus disposiciones sobre conflictos de leyes.

## 12. INFORMACIÓN DE CONTACTO

Para preguntas sobre estos Términos de Servicio, por favor contáctenos a través de los canales de contacto del Servicio.`,
    },
    privacy: {
      title: "Política de Privacidad",
      content: `# POLÍTICA DE PRIVACIDAD - SAPSAI

**Última Actualización: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}**

## 1. INTRODUCCIÓN

SAPSAI ("nosotros," "nuestro" o "nos") se compromete a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y protegemos su información cuando utiliza nuestro Servicio, en cumplimiento de la Ley 1581 de 2012 de Colombia (Ley de Protección de Datos Personales) y su decreto reglamentario 1377 de 2013.

## 2. RESPONSABLE DEL TRATAMIENTO

**Responsable del Tratamiento:**
SAPSAI
[Su Dirección de Empresa]
[Su Correo de Contacto]
[Su Teléfono de Contacto]

## 3. INFORMACIÓN QUE RECOPILAMOS

### 3.1 Información Personal para Registro y Verificación de Cuenta
Para verificar la autenticidad de cada usuario y proporcionar nuestros servicios, recopilamos:
- **Nombre Completo** (Requerido)
- **Dirección de Correo Electrónico** (Requerido)
- **Número de Teléfono** (Requerido)
- **Contraseña** (Requerido, almacenada como hash encriptado)
- **Institución** (Opcional)
- **Departamento** (Opcional)
- **Ubicación** (Opcional)
- **Biografía Profesional** (Opcional)
- **Información de Cuenta de Google** (Si utiliza Google OAuth: correo, nombre, ID de Google)

### 3.2 Información de Uso
- Imágenes subidas para clasificación
- Resultados de clasificación y metadatos
- Patrones de uso y preferencias
- Información del dispositivo y direcciones IP
- Cookies y tecnologías de seguimiento similares

## 4. FINALIDAD DEL TRATAMIENTO DE DATOS

Procesamos sus datos personales para las siguientes finalidades:
1. **Verificación de Usuario**: Para verificar la autenticidad e identidad de los usuarios
2. **Prestación del Servicio**: Para proporcionar servicios de clasificación de plantas
3. **Gestión de Cuenta**: Para gestionar su cuenta y preferencias
4. **Comunicación**: Para enviar notificaciones relacionadas con el servicio (si está habilitado)
5. **Mejora del Servicio**: Para mejorar nuestros modelos de IA y la calidad del servicio
6. **Cumplimiento Legal**: Para cumplir con las leyes y regulaciones aplicables

## 5. BASE LEGAL PARA EL TRATAMIENTO

Bajo la Ley 1581 de 2012 de Colombia, procesamos sus datos personales basándonos en:
- **Su consentimiento explícito** (Artículo 4, Ley 1581/2012)
- **Necesidad contractual** para proporcionar los servicios solicitados
- **Interés legítimo** en mejorar nuestros servicios y prevenir fraudes

## 6. CONSERVACIÓN DE DATOS

Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta Política de Privacidad, a menos que un período de conservación más largo sea requerido o permitido por la ley. Cuando elimine su cuenta, eliminaremos o anonimizaremos sus datos personales, excepto cuando estemos obligados a conservarlos para cumplimiento legal.

## 7. COMPARTIR Y DIVULGACIÓN DE DATOS

No vendemos, comercializamos ni alquilamos su información personal a terceros. Podemos compartir su información solo en las siguientes circunstancias:
- **Proveedores de Servicios**: Con proveedores de servicios de terceros de confianza que ayudan a operar nuestro Servicio (por ejemplo, almacenamiento en la nube, servicios de correo electrónico)
- **Requisitos Legales**: Cuando sea requerido por la ley o para responder a procesos legales
- **Transferencias Comerciales**: En relación con cualquier fusión, venta o transferencia de activos

## 8. SUS DERECHOS BAJO LA LEY COLOMBIANA

De acuerdo con la Ley 1581 de 2012, usted tiene los siguientes derechos:
1. **Derecho a Conocer, Actualizar y Rectificar** (Artículo 8): Acceder, actualizar y corregir sus datos personales
2. **Derecho a Solicitar Prueba de Autorización** (Artículo 8): Solicitar evidencia de su consentimiento
3. **Derecho a Revocar la Autorización** (Artículo 8): Retirar su consentimiento en cualquier momento
4. **Derecho a Solicitar Supresión** (Artículo 8): Solicitar la eliminación de sus datos cuando el tratamiento no respete los principios constitucionales y legales
5. **Derecho de Acceso Gratuito** (Artículo 8): Acceder a sus datos sin cargo
6. **Derecho a Presentar Quejas** (Artículo 15): Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) respecto a violaciones de las leyes de protección de datos

## 9. SEGURIDAD DE DATOS

Implementamos medidas técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet es 100% seguro.

## 10. COOKIES Y TECNOLOGÍAS DE SEGUIMIENTO

Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el uso y ayudar en nuestros esfuerzos de marketing. Puede controlar las cookies a través de la configuración de su navegador.

## 11. TRANSFERENCIAS INTERNACIONALES DE DATOS

Si sus datos se transfieren fuera de Colombia, nos aseguramos de que existan salvaguardas apropiadas de acuerdo con las regulaciones colombianas de protección de datos.

## 12. PRIVACIDAD DE MENORES

Nuestro Servicio no está dirigido a menores de 18 años. No recopilamos conscientemente información personal de menores de 18 años.

## 13. CAMBIOS A ESTA POLÍTICA DE PRIVACIDAD

Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos de cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "Última Actualización".

## 14. CONTÁCTENOS

Para ejercer sus derechos o para preguntas sobre esta Política de Privacidad, por favor contáctenos:
- **Correo Electrónico**: [Su Correo de Contacto]
- **Dirección**: [Su Dirección de Empresa]
- **Teléfono**: [Su Teléfono de Contacto]

También puede presentar quejas ante la Superintendencia de Industria y Comercio (SIC) de Colombia en: www.sic.gov.co`,
    },
  },
};

// TermsModal Component
function TermsModal({ isOpen, onClose, type = "terms" }) {
  const { preferences } = useStore();
  const defaultLanguage = preferences?.language || "en";
  const [modalLanguage, setModalLanguage] = useState(
    defaultLanguage === "es" ? "es" : "en"
  );
  
  // Reset language to user preference when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalLanguage(defaultLanguage === "es" ? "es" : "en");
    }
  }, [isOpen, defaultLanguage]);
  
  const content = TermsAndPrivacyContent[modalLanguage][type];
  const Icon = type === "terms" ? FaFileContract : FaShieldAlt;
  
  const toggleLanguage = () => {
    setModalLanguage(modalLanguage === "es" ? "en" : "es");
  };

  // Format markdown-like content to HTML
  const formatContent = (text) => {
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('# ')) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<h1 class="text-xl font-bold mt-6 mb-3 text-gray-900">${trimmed.substring(2)}</h1>`;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<h2 class="text-lg font-semibold mt-5 mb-2 text-gray-800">${trimmed.substring(3)}</h2>`;
        continue;
      }
      if (trimmed.startsWith('### ')) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<h3 class="text-base font-semibold mt-4 mb-2 text-gray-700">${trimmed.substring(4)}</h3>`;
        continue;
      }
      
      // List items
      if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
        if (!inList) {
          html += '<ul class="list-disc ml-6 mb-3 space-y-1">';
          inList = true;
        }
        let content = trimmed.substring(2);
        // Process bold text in list items
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        html += `<li class="text-gray-700">${content}</li>`;
        continue;
      }
      
      // Close list if we hit a non-list line
      if (inList && trimmed !== '') {
        html += '</ul>';
        inList = false;
      }
      
      // Empty lines
      if (trimmed === '') {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += '<br>';
        continue;
      }
      
      // Regular paragraphs
      let content = trimmed;
      // Process bold text
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
      html += `<p class="mb-3 text-gray-700 leading-relaxed">${content}</p>`;
    }
    
    // Close any open list
    if (inList) {
      html += '</ul>';
    }
    
    return html;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="text-green-600 h-6 w-6" />}
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-900"
                    >
                      {content.title}
                    </Dialog.Title>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Language Toggle */}
                    <button
                      onClick={toggleLanguage}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      title={modalLanguage === "es" ? "Switch to English" : "Cambiar a Español"}
                    >
                      <span className={modalLanguage === "es" ? "font-semibold text-green-600" : "text-gray-500"}>
                        ES
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className={modalLanguage === "en" ? "font-semibold text-green-600" : "text-gray-500"}>
                        EN
                      </span>
                    </button>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: formatContent(content.content),
                    }}
                  />
                </div>
                <div className="flex justify-end mt-6 pt-4 border-t">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    {modalLanguage === "es" ? "Cerrar" : "Close"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default function LoginForm({
  comesFrom = "",
  checkout = null,
  onLogin,
}) {
  const { setUiState, setSelectedPage } = useStore();
  const { localLogin, googleLogin, localRegister } = useAuth(false);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Modal state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [modalType, setModalType] = useState("terms");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register form state
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form validation state
  const [errors, setErrors] = useState({});

  const handleTermsClick = (e, type) => {
    e.preventDefault();
    setModalType(type);
    if (type === "terms") {
      setShowTermsModal(true);
    } else {
      setShowPrivacyModal(true);
    }
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!loginEmail) newErrors.loginEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginEmail))
      newErrors.loginEmail = "Email is invalid";

    if (!loginPassword) newErrors.loginPassword = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};

    if (!name) newErrors.name = "Name is required";

    if (!registerEmail) newErrors.registerEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(registerEmail))
      newErrors.registerEmail = "Email is invalid";

    if (!registerPassword) newErrors.registerPassword = "Password is required";
    else if (registerPassword.length < 6)
      newErrors.registerPassword = "Password must be at least 6 characters";

    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (confirmPassword !== registerPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (validateLoginForm()) {
      setIsLoading(true);
      localLogin(loginEmail, loginPassword)
        .then((response) => {
          setUiState({
            showLoginAnimation: true,
          });
          if (response.role === "ADMIN") {
            setSelectedPage("admin");
            navigate("/admin");
          } else {
            setSelectedPage("upload");
            navigate("/upload");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Login failed:", error);
          showNotification({
            message: error.response?.data?.error || "Login failed",
            type: "error",
          });
          setIsLoading(false);
        });
    }
  };

  const handleGoogleLogin = async (redirectTo = "/upload") => {
    setSelectedPage("upload");
    window.location.href = `${apiUrl}/auth/google?redirectTo=${encodeURIComponent(
      redirectTo
    )}`;
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (validateRegisterForm()) {
      setIsLoading(true);

      // Simulate API call
      localRegister(name, registerEmail, registerPassword, phone)
        .then((response) => {
          showNotification({
            message: "Registration successful",
            type: "success",
          });
          setIsLoading(false);
          localLogin(registerEmail, registerPassword)
            .then(() => {
              if (comesFrom.pathname === "/booking") {
              } else {
                setSelectedPage("upload");
                navigate("/upload");
                setIsLoading(false);
                setUiState({
                  login: {
                    comesFrom: {
                      pathname: "",
                      search: "",
                      key: "",
                    },
                  },
                });
              }
            })
            .catch((error) => {
              showNotification({
                message: "Error loggin in",
                type: "error",
              });
              setIsLoading(false);
            });
        })
        .catch((error) => {
          showNotification({
            message: error.response.data.error || "Registration failed",
            type: "error",
          });
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden text-black">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer ${
            isLogin
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer ${
            !isLogin
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setIsLogin(false)}
        >
          Register
        </button>
      </div>

      {/* Login Form */}
      {isLogin ? (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Login</h2>
          <p className="text-sm text-gray-600 mb-6">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleLoginSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email-login"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email-login"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.loginEmail ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.loginEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.loginEmail}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password-login"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password-login"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.loginPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.loginPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.loginPassword}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                {/* <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div> */}
                {/* <a
                  href="#"
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  Forgot password?
                </a> */}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 h-4 w-4" /> Signing
                    in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <button
                onClick={() => {
                  setUiState({ showLoginAnimation: true });
                  handleGoogleLogin();
                }}
                type="button"
                className="cursor-pointer w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
                Sign in with Google
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Registration Form */
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Create an account
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Enter your information to create an account
          </p>

          <form onSubmit={handleRegisterSubmit}>
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email-register"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email-register"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.registerEmail
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.registerEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.registerEmail}
                  </p>
                )}
              </div>

              {/* Phone Input */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password-register"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password-register"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.registerPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.registerPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.registerPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${
                        errors.agreeTerms ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="font-medium text-gray-700"
                    >
                      I agree to the{" "}
                      <a
                        href="#"
                        onClick={(e) => handleTermsClick(e, "terms")}
                        className="text-green-600 hover:text-green-500 underline cursor-pointer"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        onClick={(e) => handleTermsClick(e, "privacy")}
                        className="text-green-600 hover:text-green-500 underline cursor-pointer"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>
                {errors.agreeTerms && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.agreeTerms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 h-4 w-4" /> Creating
                    account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
                Sign up with Google
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Terms and Privacy Modals */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type="terms"
      />
      <TermsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        type="privacy"
      />
    </div>
  );
}
