import { link, list, nexoContact, nexoEmailHref, paragraph, type NexoDocument, type NexoDocumentKey } from "./nexoLegal";

export const nexoLegalEs: Record<NexoDocumentKey, NexoDocument> = {
  privacy: {
    title: "Política de privacidad de Nexo",
    description: "Información sobre el tratamiento de datos personales relacionado con Nexo y su integración prevista con WhatsApp Business Platform.",
    sections: [
      { title: "Identificación del proveedor", blocks: [
        paragraph("Nexo es una aplicación tecnológica de BOSTON BILINGUAL SCHOOL en desarrollo. Su titular está identificado con RUC N.º 20613627392 y domicilio fiscal en CAL. SAN ANDRES MZA. U LOTE. 35 URB. SAN ANDRES 1 ERA ETAPA, TRUJILLO, LA LIBERTAD, PERÚ."),
        paragraph("La presente política describe el tratamiento de datos personales relacionado con Nexo, incluidos los servicios de gestión de conversaciones, atención de consultas y conexión con WhatsApp Business Platform, en la medida en que estén habilitados."),
      ] },
      { title: "Ámbito de aplicación y responsabilidades", blocks: [
        paragraph("Esta política se aplicará al tratamiento de datos mediante Nexo cuando se utilice como plataforma de atención y gestión de comunicaciones."),
        paragraph("Cuando un colegio u otra organización utilice Nexo para atender a sus propios contactos, dicho cliente determinará las finalidades de la comunicación y las condiciones de tratamiento que le correspondan legalmente. Boston Bilingual School proporcionará la solución tecnológica y, cuando proceda, actuará como encargado del tratamiento conforme a las instrucciones del cliente y los acuerdos aplicables."),
        paragraph("Boston Bilingual School puede actuar como responsable respecto de la información necesaria para administrar sus propias relaciones comerciales, cuentas de clientes, consultas de soporte, seguridad y obligaciones legales."),
        paragraph("Las personas que se comuniquen con un colegio usuario de Nexo también deben consultar la política de privacidad de ese colegio."),
      ] },
      { title: "Categorías de datos personales", blocks: [
        paragraph("Dependiendo de la configuración y del uso autorizado de Nexo, pueden tratarse las siguientes categorías de datos:"),
        list([
          "Datos de identificación y contacto, como nombres, números telefónicos y direcciones de correo electrónico.",
          "Datos de conversaciones, como mensajes enviados y recibidos por WhatsApp, fechas, horas y estados de atención.",
          "Información proporcionada voluntariamente durante una consulta, incluida aquella relacionada con solicitudes de admisión, servicios educativos o seguimiento de atención.",
          "Datos de cuentas de personal autorizado, como nombre, correo electrónico, rol y organización a la que pertenece.",
          "Información técnica necesaria para administrar la conexión con WhatsApp Business Platform, como identificadores de cuentas empresariales, números asociados, identificadores de mensajes, estados de entrega y registros operativos.",
          "Archivos adjuntos u otros contenidos multimedia únicamente cuando la integración y las funcionalidades efectivamente implementadas permitan su tratamiento.",
        ]),
        paragraph("Nexo no exige que las personas envíen documentos sensibles ni información innecesaria para consultas ordinarias."),
      ] },
      { title: "Origen de los datos", blocks: [
        paragraph("Los datos pueden obtenerse cuando una persona se comunica con un colegio mediante WhatsApp, cuando un asesor autorizado registra o actualiza información en Nexo o cuando la plataforma recibe eventos y datos técnicos mediante integraciones autorizadas con Meta, según las funciones habilitadas."),
        paragraph("Los colegios clientes son responsables de obtener las autorizaciones necesarias para comunicarse con las personas y utilizar sus datos conforme a las finalidades informadas."),
      ] },
      { title: "Finalidades del tratamiento", blocks: [
        paragraph("Cuando se habiliten las funciones correspondientes, los datos podrán utilizarse, según corresponda, para:"),
        list([
          "Recibir y organizar comunicaciones.",
          "Asignar conversaciones a asesores autorizados.",
          "Responder consultas y realizar seguimiento.",
          "Gestionar contactos y solicitudes relacionadas con el servicio del colegio.",
          "Administrar cuentas y permisos de acceso.",
          "Mantener la integración técnica con WhatsApp Business Platform.",
          "Prevenir accesos indebidos, investigar incidencias y prestar soporte.",
          "Atender solicitudes relacionadas con derechos de protección de datos.",
          "Cumplir obligaciones legales aplicables.",
        ]),
        paragraph("Cualquier finalidad adicional deberá contar con sustento legal y comunicarse cuando corresponda. El eventual uso de conversaciones para entrenar modelos de inteligencia artificial requeriría una evaluación y una actualización específica de esta política; esta política no declara ese uso."),
      ] },
      { title: "Fundamento del tratamiento y comunicaciones por WhatsApp", blocks: [
        paragraph("Los tratamientos deberán sustentarse en las bases jurídicas y autorizaciones que correspondan conforme a la legislación aplicable."),
        paragraph("Los colegios clientes deberán proporcionar información adecuada y obtener los consentimientos exigibles antes de iniciar comunicaciones por WhatsApp. También deberán respetar las solicitudes de las personas para dejar de recibir comunicaciones."),
        paragraph("La utilización de Nexo no sustituye las obligaciones propias de cada colegio respecto de sus contactos."),
      ] },
      { title: "Integración con Meta y WhatsApp", blocks: [
        paragraph("Nexo está destinado a utilizar las herramientas oficiales de WhatsApp Business Platform para gestionar comunicaciones autorizadas, cuando la integración correspondiente esté habilitada."),
        paragraph("La incorporación de Boston Bilingual School como proveedor tecnológico de Meta aún no ha sido aprobada."),
        paragraph("La prestación del servicio puede implicar el intercambio de información técnica y de mensajería con Meta y las entidades responsables de los servicios de WhatsApp, de acuerdo con sus condiciones y políticas aplicables."),
        paragraph("Boston Bilingual School no es propietaria de WhatsApp ni representa a Meta. WhatsApp es un servicio externo sujeto a sus propias reglas y disponibilidad."),
        paragraph("Cada colegio deberá autorizar la vinculación de sus recursos empresariales cuando corresponda."),
        link("Consulte la ", "Política de mensajes de WhatsApp Business", "https://business.whatsapp.com/policy/", "."),
        link("Consulte también los ", "Términos de la plataforma de Meta", "https://developers.facebook.com/terms/", "."),
      ] },
      { title: "Proveedores tecnológicos y transferencias de información", blocks: [
        paragraph("Para operar Nexo pueden ser necesarios proveedores de infraestructura, alojamiento, almacenamiento, seguridad, comunicaciones y servicios relacionados."),
        paragraph("Los datos únicamente deberán ponerse a disposición de proveedores en la medida necesaria para cumplir las finalidades autorizadas y bajo las condiciones correspondientes."),
        paragraph("Cuando exista almacenamiento, acceso o transferencia internacional de información, deberá evaluarse y comunicarse conforme a la legislación aplicable."),
      ] },
      { title: "Conservación de información", blocks: [
        paragraph("Los datos se conservarán durante el tiempo necesario para prestar el servicio, cumplir las finalidades autorizadas, ejecutar los acuerdos aplicables y atender obligaciones legales."),
        paragraph("La duración de conservación puede depender de las instrucciones del colegio cliente, del tipo de información y de los requisitos legales correspondientes."),
        paragraph("Al finalizar la relación contractual, se atenderán las obligaciones aplicables de devolución, supresión o conservación justificada de información."),
        paragraph("Las copias de respaldo y los registros técnicos estarán sujetos a los procedimientos de conservación y eliminación que correspondan."),
      ] },
      { title: "Seguridad y control de acceso", blocks: [
        paragraph("Boston Bilingual School adoptará medidas técnicas y organizativas apropiadas para proteger los datos tratados mediante Nexo, considerando los riesgos de acceso no autorizado, pérdida, alteración o divulgación indebida."),
        paragraph("La aplicación deberá limitar el acceso a la información conforme a los permisos autorizados y separar los recursos correspondientes a cada organización cliente."),
        paragraph("Ninguna medida técnica puede garantizar la inexistencia absoluta de riesgos."),
      ] },
      { title: "Derechos de las personas", blocks: [
        paragraph("Las personas pueden ejercer los derechos reconocidos por la normativa aplicable, incluyendo acceso, rectificación, cancelación y oposición, además de los demás derechos que legalmente correspondan."),
        paragraph("Cuando la solicitud se refiera a datos tratados por un colegio usuario de Nexo, podrá ser necesario canalizarla hacia ese colegio, por ser la organización que determina las finalidades del tratamiento."),
        paragraph("Boston Bilingual School colaborará en la atención de solicitudes conforme a sus responsabilidades legales y contractuales."),
        paragraph("Podrá solicitarse información razonablemente necesaria para comprobar la identidad o autorización del solicitante, evitando recopilar datos excesivos."),
        link("Consulte el ", "procedimiento de eliminación de datos de Nexo", "/nexo/eliminacion-de-datos/", "."),
      ] },
      { title: "Información relacionada con menores de edad", blocks: [
        paragraph("Nexo está destinado al uso empresarial por personal autorizado de instituciones y organizaciones, no al uso independiente de menores de edad."),
        paragraph("Dado que algunos colegios pueden recibir consultas relacionadas con estudiantes, incluidos menores, las organizaciones usuarias deberán limitar la recopilación a la información necesaria y respetar las obligaciones especiales que correspondan a estos datos."),
        paragraph("No deberán solicitarse ni incorporarse datos sensibles de estudiantes sin una finalidad legítima y las condiciones legales necesarias."),
      ] },
      { title: "Cambios en la política", blocks: [
        paragraph("Boston Bilingual School podrá actualizar esta política cuando cambien las funcionalidades de Nexo, sus proveedores, las obligaciones legales o las condiciones de tratamiento de información."),
        paragraph("La versión actualizada indicará su fecha de publicación y estará disponible en esta misma dirección."),
      ] },
      { title: "Contacto para privacidad", blocks: [
        paragraph("Para consultas sobre el tratamiento de datos mediante Nexo y solicitudes relacionadas con sus derechos, puede comunicarse con Boston Bilingual School a través de:"),
        link("Correo electrónico: ", nexoContact, nexoEmailHref("Privacidad de datos — Nexo"), "."),
        paragraph("Asunto recomendado: Privacidad de datos — Nexo."),
        paragraph("Si la consulta corresponde a una organización que utiliza Nexo, indique el nombre de dicha organización para facilitar el tratamiento adecuado de la solicitud. No incluya contraseñas, códigos de acceso ni información sensible innecesaria."),
        link("Consulte los ", "términos y condiciones de Nexo", "/nexo/terminos/", "."),
        link("Consulte también el ", "procedimiento de eliminación de datos", "/nexo/eliminacion-de-datos/", "."),
      ] },
    ],
  },
  terms: {
    title: "Términos y condiciones de Nexo",
    description: "Condiciones generales para el acceso y utilización de los servicios tecnológicos de Nexo.",
    sections: [
      { title: "Proveedor e identificación", blocks: [
        paragraph("Nexo es una aplicación tecnológica de BOSTON BILINGUAL SCHOOL en desarrollo. Su titular está identificado con RUC N.º 20613627392 y domicilio fiscal en CAL. SAN ANDRES MZA. U LOTE. 35 URB. SAN ANDRES 1 ERA ETAPA, TRUJILLO, LA LIBERTAD, PERÚ."),
        paragraph("Estos términos regulan de manera general el acceso y la utilización de Nexo. Las condiciones comerciales específicas podrán desarrollarse mediante contratos, propuestas o acuerdos suscritos con cada organización cliente."),
      ] },
      { title: "Descripción del servicio", blocks: [
        paragraph("Nexo está orientado a facilitar la recepción, organización, asignación y seguimiento de comunicaciones empresariales, particularmente mediante integraciones autorizadas con WhatsApp Business Platform."),
        paragraph("Las funciones disponibles dependerán de la versión implementada, el plan contratado, los permisos otorgados y las integraciones habilitadas."),
        paragraph("Las funcionalidades en desarrollo o anunciadas para el futuro no se considerarán disponibles hasta su puesta en funcionamiento."),
      ] },
      { title: "Clientes y usuarios autorizados", blocks: [
        paragraph("El acceso empresarial a Nexo corresponde a organizaciones que contratan o están autorizadas a utilizar el servicio."),
        paragraph("Cada cliente determinará qué integrantes de su equipo pueden acceder y qué funciones les corresponden, dentro de los controles disponibles."),
        paragraph("Los usuarios deberán proteger sus credenciales y utilizar las herramientas exclusivamente para fines autorizados."),
        paragraph("Los clientes son responsables de administrar adecuadamente los accesos de su personal."),
      ] },
      { title: "Integraciones con Meta y WhatsApp", blocks: [
        paragraph("Las funcionalidades de mensajería dependen de servicios proporcionados por Meta y WhatsApp, sujetos a sus propias condiciones, requisitos, autorizaciones, políticas, costos y disponibilidad."),
        paragraph("La incorporación de Boston Bilingual School como proveedor tecnológico de Meta aún no ha sido aprobada."),
        paragraph("Nexo no implica propiedad sobre WhatsApp ni garantiza la aprobación de cuentas, números telefónicos, plantillas o permisos por parte de Meta."),
        paragraph("Cada cliente deberá autorizar sus cuentas y cumplir las condiciones de las plataformas externas."),
        paragraph("Boston Bilingual School proporciona una solución tecnológica independiente, sin atribuirse representación legal de Meta."),
      ] },
      { title: "Obligaciones del cliente", blocks: [
        paragraph("Los clientes se comprometen a utilizar Nexo de forma lícita, respetar las normas de protección de datos, obtener las autorizaciones necesarias para sus comunicaciones, atender las solicitudes de sus contactos y evitar comunicaciones engañosas, no consentidas o contrarias a las políticas de WhatsApp."),
        paragraph("No podrán utilizar Nexo para acceder sin autorización a información de terceros, distribuir contenido ilegal, suplantar identidades o vulnerar la seguridad de otros usuarios."),
        paragraph("El cliente es responsable de la legitimidad y exactitud de la información que introduce y de las instrucciones que proporciona a su personal."),
      ] },
      { title: "Datos y confidencialidad", blocks: [
        paragraph("Los datos personales y contenidos comunicacionales administrados por cada cliente deberán tratarse conforme a la legislación aplicable, la Política de privacidad de Nexo y los acuerdos de tratamiento de datos correspondientes."),
        paragraph("El acceso técnico a información del cliente deberá limitarse a las finalidades autorizadas, incluyendo operación, mantenimiento, seguridad y soporte cuando corresponda."),
        paragraph("Nexo no transfiere al proveedor la titularidad del contenido aportado por el cliente."),
        link("Lea la ", "Política de privacidad de Nexo", "/nexo/privacidad/", "."),
      ] },
      { title: "Condiciones económicas", blocks: [
        paragraph("Los precios, períodos de prueba, servicios incluidos, renovaciones, facturación y condiciones de pago se establecerán en las propuestas o acuerdos comerciales correspondientes."),
        paragraph("Los cargos derivados de servicios externos, incluida la mensajería de WhatsApp Business Platform, se identificarán conforme al modelo de contratación aplicable."),
        paragraph("El pago por utilizar Nexo no representa una adquisición o reventa independiente de la infraestructura de Meta."),
      ] },
      { title: "Propiedad intelectual", blocks: [
        paragraph("Boston Bilingual School conserva los derechos que legalmente le correspondan sobre Nexo, sus componentes originales, documentación, diseño y software."),
        paragraph("La contratación concede al cliente únicamente los derechos de uso especificados en el acuerdo correspondiente."),
        paragraph("Los elementos de terceros se regirán por sus propias licencias y condiciones."),
      ] },
      { title: "Disponibilidad y soporte", blocks: [
        paragraph("Una vez habilitado el servicio, Boston Bilingual School procurará mantener la continuidad y el funcionamiento adecuado de Nexo, conforme al alcance contratado."),
        paragraph("Pueden producirse interrupciones por mantenimiento, incidentes técnicos, conectividad, proveedores externos o decisiones de las plataformas integradas."),
        paragraph("Los compromisos específicos de disponibilidad, tiempos de atención y niveles de servicio deberán establecerse expresamente cuando correspondan."),
      ] },
      { title: "Suspensión y terminación", blocks: [
        paragraph("El acceso podrá ser suspendido o limitado conforme al contrato y las obligaciones legales aplicables, especialmente ante usos no autorizados, riesgos de seguridad o incumplimientos relevantes."),
        paragraph("Las condiciones de cancelación, devolución o eliminación de datos se regirán por el acuerdo aplicable, la Política de privacidad y las obligaciones legales correspondientes."),
        paragraph("La terminación del servicio no implica necesariamente la eliminación inmediata de datos que deban conservarse por una obligación legal."),
      ] },
      { title: "Responsabilidades y limitaciones", blocks: [
        paragraph("Cada parte será responsable de las obligaciones que le correspondan conforme a la legislación y a los acuerdos aplicables."),
        paragraph("Boston Bilingual School no controla las decisiones independientes de Meta y WhatsApp respecto de cuentas, permisos, restricciones o disponibilidad de sus plataformas."),
        paragraph("Las limitaciones de responsabilidad que se pacten deberán respetar las disposiciones legales aplicables y no excluir derechos irrenunciables."),
      ] },
      { title: "Modificaciones", blocks: [
        paragraph("Las condiciones podrán actualizarse conforme a las necesidades del servicio, cambios tecnológicos o modificaciones legales."),
        paragraph("Cuando corresponda, se informará a los clientes de cambios relevantes por los canales establecidos y se respetarán las condiciones contractuales aplicables."),
      ] },
      { title: "Legislación y contacto", blocks: [
        paragraph("Estos términos se interpretarán conforme a la legislación peruana aplicable, sin perjuicio de otras normas imperativas que correspondan."),
        paragraph("Para consultas relacionadas con los términos de Nexo, puede comunicarse con Boston Bilingual School, RUC 20613627392:"),
        link("Correo de contacto: ", nexoContact, nexoEmailHref("Consulta sobre términos — Nexo"), "."),
        link("Sitio web: ", "https://bostonbbs.com", "https://bostonbbs.com", "."),
        link("Consulte la ", "Política de privacidad de Nexo", "/nexo/privacidad/", "."),
        link("Consulte también el ", "procedimiento de eliminación de datos", "/nexo/eliminacion-de-datos/", "."),
      ] },
    ],
  },
  deletion: {
    title: "Solicitud de eliminación de datos de Nexo",
    description: "Conoce cómo solicitar la eliminación de información personal relacionada con Nexo.",
    sections: [
      { title: "Introducción", blocks: [
        paragraph("Boston Bilingual School ofrece mecanismos para recibir y tramitar solicitudes relacionadas con la eliminación de datos personales tratados mediante Nexo, de acuerdo con las responsabilidades de las partes y la legislación aplicable."),
        paragraph("Esta página explica cómo presentar una solicitud y cómo se gestionará según la relación de la persona con el servicio."),
      ] },
      { title: "¿Quién puede presentar una solicitud?", blocks: [
        paragraph("Las solicitudes pueden ser presentadas por:"),
        list([
          "Personas que se comunicaron con una organización que utiliza Nexo.",
          "Personal autorizado de un colegio u organización cliente.",
          "Representantes autorizados de una organización que utiliza Nexo.",
          "Otras personas que consideren que sus datos personales están siendo tratados mediante el servicio.",
        ]),
        paragraph("La atención de la solicitud dependerá de la identificación de los datos y de las responsabilidades legales aplicables."),
      ] },
      { title: "Cómo solicitar la eliminación", blocks: [
        paragraph("Para solicitar la eliminación de datos personales relacionados con Nexo, envía un correo electrónico a:"),
        link("", nexoContact, nexoEmailHref("Solicitud de eliminación de datos — Nexo"), "."),
        paragraph("Asunto: Solicitud de eliminación de datos — Nexo. En el mensaje indica:"),
        list([
          "Tu nombre o la identificación necesaria para ubicar la solicitud.",
          "El colegio u organización con la que mantuviste comunicación, cuando corresponda.",
          "El número de teléfono o correo electrónico asociado a los datos cuya eliminación solicitas.",
          "Una descripción breve de la información que deseas eliminar.",
        ], true),
        paragraph("No envíes contraseñas, códigos de verificación ni documentos de identidad sensibles de forma espontánea."),
        paragraph("Podremos solicitar información adicional estrictamente necesaria cuando corresponda verificar identidad, representación o autorización."),
      ] },
      { title: "Qué sucede después de recibir la solicitud", blocks: [
        paragraph("Boston Bilingual School examinará la solicitud para identificar la información involucrada y determinar si actúa como responsable del tratamiento o como proveedor que trata datos por encargo de un cliente."),
        paragraph("Cuando los datos correspondan a un colegio cliente que decide sus finalidades de tratamiento, podrá ser necesario trasladar o coordinar la solicitud con dicho colegio."),
        paragraph("Cuando proceda la eliminación, esta se realizará conforme al alcance técnicamente disponible, las instrucciones aplicables y las obligaciones legales correspondientes."),
        paragraph("Se comunicará una respuesta por el medio de contacto proporcionado, dentro de los plazos legalmente aplicables."),
      ] },
      { title: "Alcance y posibles limitaciones", blocks: [
        paragraph("La eliminación puede comprender información almacenada y administrada directamente mediante Nexo, siempre que corresponda legal y técnicamente."),
        paragraph("Algunas categorías de información pueden estar sujetas a conservación obligatoria, necesidades justificadas de seguridad, registros de cumplimiento o procedimientos de respaldo."),
        paragraph("La eliminación de datos almacenados mediante Nexo no garantiza la eliminación de copias conservadas legítimamente por el colegio cliente, Meta, WhatsApp u otros responsables independientes."),
      ] },
      { title: "Revocación de accesos", blocks: [
        paragraph("Cuando corresponda, los administradores autorizados de las organizaciones clientes podrán solicitar la revocación de accesos y conexiones asociadas a Nexo."),
        paragraph("La desvinculación de una cuenta empresarial o aplicación y la eliminación de los datos previamente tratados son procesos distintos."),
        paragraph("La revocación de permisos de Meta no constituye, por sí misma, una solicitud de eliminación de información conservada legítimamente por otros responsables."),
      ] },
      { title: "Derechos adicionales", blocks: [
        paragraph("Además de solicitar la eliminación, las personas pueden ejercer los derechos de acceso, rectificación, oposición y demás derechos reconocidos por las normas de protección de datos aplicables."),
        link("Para conocer cómo se trata la información, consulta la ", "Política de privacidad de Nexo", "/nexo/privacidad/", "."),
      ] },
      { title: "Contacto", blocks: [
        paragraph("Responsable de atención de solicitudes: BOSTON BILINGUAL SCHOOL. RUC: 20613627392. Domicilio fiscal: CAL. SAN ANDRES MZA. U LOTE. 35 URB. SAN ANDRES 1 ERA ETAPA, TRUJILLO, LA LIBERTAD, PERÚ."),
        link("Correo: ", nexoContact, nexoEmailHref("Solicitud de eliminación de datos — Nexo"), "."),
        paragraph("Las solicitudes se atenderán conforme a la normativa aplicable y las responsabilidades de las partes involucradas."),
      ] },
    ],
  },
};
