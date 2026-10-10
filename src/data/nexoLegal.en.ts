import { link, list, nexoContact, nexoEmailHref, paragraph, type NexoDocument, type NexoDocumentKey } from "./nexoLegal";

export const nexoLegalEn: Record<NexoDocumentKey, NexoDocument> = {
  privacy: {
    title: "Nexo privacy policy",
    description: "Information about personal data processing related to Nexo and its planned integration with the WhatsApp Business Platform.",
    sections: [
      { title: "Provider identification", blocks: [
        paragraph("Nexo is a technology application of BOSTON BILINGUAL SCHOOL currently under development. Its owner is identified by Peruvian taxpayer number (RUC) 20613627392, with its registered tax address at CAL. SAN ANDRES MZA. U LOTE. 35 URB. SAN ANDRES 1 ERA ETAPA, TRUJILLO, LA LIBERTAD, PERÚ."),
        paragraph("This policy describes the processing of personal data related to Nexo, including conversation management, inquiry handling and connection to the WhatsApp Business Platform, to the extent those services are enabled."),
      ] },
      { title: "Scope and responsibilities", blocks: [
        paragraph("This policy will apply to data processing through Nexo when it is used as a platform for handling and managing communications."),
        paragraph("When a school or another organization uses Nexo to assist its own contacts, that client will determine the purposes of the communications and the processing conditions for which it is legally responsible. Boston Bilingual School will provide the technology solution and, where applicable, act as a data processor under the client's instructions and the applicable agreements."),
        paragraph("Boston Bilingual School may act as a data controller for information needed to manage its own commercial relationships, client accounts, support inquiries, security and legal obligations."),
        paragraph("People who communicate with a school using Nexo should also consult that school's privacy policy."),
      ] },
      { title: "Categories of personal data", blocks: [
        paragraph("Depending on Nexo's configuration and authorized use, the following categories of data may be processed:"),
        list([
          "Identification and contact details, such as names, telephone numbers and email addresses.",
          "Conversation data, such as WhatsApp messages sent and received, dates, times and service status.",
          "Information voluntarily provided during an inquiry, including information related to admission requests, educational services or follow-up.",
          "Authorized staff account data, such as name, email address, role and affiliated organization.",
          "Technical information needed to manage the connection to the WhatsApp Business Platform, such as business account identifiers, associated numbers, message identifiers, delivery status and operational logs.",
          "Attachments or other multimedia content only when the integration and actually implemented features permit their processing.",
        ]),
        paragraph("Nexo does not require people to send sensitive documents or information unnecessary for ordinary inquiries."),
      ] },
      { title: "Sources of data", blocks: [
        paragraph("Data may be obtained when a person communicates with a school through WhatsApp, when an authorized adviser records or updates information in Nexo, or when the platform receives events and technical data through authorized Meta integrations, depending on the features enabled."),
        paragraph("Client schools are responsible for obtaining the authorizations needed to communicate with people and use their data for the purposes communicated to them."),
      ] },
      { title: "Purposes of processing", blocks: [
        paragraph("When the relevant features are enabled, data may be used, as applicable, to:"),
        list([
          "Receive and organize communications.",
          "Assign conversations to authorized advisers.",
          "Answer inquiries and follow up.",
          "Manage contacts and requests related to the school's services.",
          "Administer accounts and access permissions.",
          "Maintain the technical integration with the WhatsApp Business Platform.",
          "Prevent unauthorized access, investigate incidents and provide support.",
          "Handle requests concerning data protection rights.",
          "Comply with applicable legal obligations.",
        ]),
        paragraph("Any additional purpose must have a lawful basis and be communicated where required. Any future use of conversations to train artificial intelligence models would require a separate assessment and a specific update to this policy; this policy does not state that such use occurs."),
      ] },
      { title: "Legal basis and WhatsApp communications", blocks: [
        paragraph("Processing must rely on the legal bases and authorizations required under applicable law."),
        paragraph("Client schools must provide appropriate information and obtain any required consent before initiating WhatsApp communications. They must also honor people's requests to stop receiving communications."),
        paragraph("Using Nexo does not replace each school's own obligations toward its contacts."),
      ] },
      { title: "Integration with Meta and WhatsApp", blocks: [
        paragraph("Nexo is intended to use the official WhatsApp Business Platform tools to manage authorized communications when the relevant integration is enabled."),
        paragraph("Boston Bilingual School's onboarding as a Meta technology provider has not yet been approved."),
        paragraph("Providing the service may involve exchanging technical and messaging information with Meta and the entities responsible for WhatsApp services, under their applicable terms and policies."),
        paragraph("Boston Bilingual School does not own WhatsApp or represent Meta. WhatsApp is an external service subject to its own rules and availability."),
        paragraph("Each school must authorize the connection of its business resources when applicable."),
        link("Read the ", "WhatsApp Business Messaging Policy", "https://business.whatsapp.com/policy/", "."),
        link("Also read the ", "Meta Platform Terms", "https://developers.facebook.com/terms/", "."),
      ] },
      { title: "Technology providers and data transfers", blocks: [
        paragraph("Operating Nexo may require providers of infrastructure, hosting, storage, security, communications and related services."),
        paragraph("Data should be made available to providers only to the extent necessary to fulfill authorized purposes and under the relevant conditions."),
        paragraph("Any international storage, access or transfer of information must be assessed and communicated in accordance with applicable law."),
      ] },
      { title: "Data retention", blocks: [
        paragraph("Data will be retained for as long as necessary to provide the service, fulfill authorized purposes, perform applicable agreements and meet legal obligations."),
        paragraph("Retention periods may depend on the client school's instructions, the type of information and applicable legal requirements."),
        paragraph("At the end of the contractual relationship, applicable obligations concerning return, deletion or justified retention of information will be addressed."),
        paragraph("Backups and technical logs will be subject to the relevant retention and deletion procedures."),
      ] },
      { title: "Security and access control", blocks: [
        paragraph("Boston Bilingual School will adopt appropriate technical and organizational measures to protect data processed through Nexo, taking into account the risks of unauthorized access, loss, alteration or improper disclosure."),
        paragraph("The application must limit access to information according to authorized permissions and separate the resources belonging to each client organization."),
        paragraph("No technical measure can guarantee the complete absence of risk."),
      ] },
      { title: "Individuals' rights", blocks: [
        paragraph("Individuals may exercise the rights recognized by applicable law, including access, rectification, cancellation and objection, as well as any other rights to which they are legally entitled."),
        paragraph("When a request concerns data processed by a school using Nexo, it may need to be referred to that school because the school determines the purposes of processing."),
        paragraph("Boston Bilingual School will assist with requests in accordance with its legal and contractual responsibilities."),
        paragraph("Information reasonably necessary to verify the requester's identity or authority may be requested, while avoiding excessive data collection."),
        link("See the ", "Nexo data deletion procedure", "/en/nexo/data-deletion/", "."),
      ] },
      { title: "Information concerning minors", blocks: [
        paragraph("Nexo is intended for business use by authorized staff of institutions and organizations, not for independent use by minors."),
        paragraph("Because some schools may receive inquiries relating to students, including minors, the organizations using Nexo must limit collection to necessary information and comply with the special obligations applicable to such data."),
        paragraph("Sensitive student data must not be requested or entered without a legitimate purpose and the necessary legal conditions."),
      ] },
      { title: "Changes to this policy", blocks: [
        paragraph("Boston Bilingual School may update this policy when Nexo's features, its providers, legal obligations or data processing conditions change."),
        paragraph("The updated version will state its publication date and remain available at this address."),
      ] },
      { title: "Privacy contact", blocks: [
        paragraph("For inquiries about data processing through Nexo and requests concerning your rights, contact Boston Bilingual School at:"),
        link("Email: ", nexoContact, nexoEmailHref("Data privacy — Nexo"), "."),
        paragraph("Suggested subject: Data privacy — Nexo."),
        paragraph("If your inquiry concerns an organization using Nexo, state that organization's name so the request can be handled appropriately. Do not include passwords, access codes or unnecessary sensitive information."),
        link("Read the ", "Nexo terms and conditions", "/en/nexo/terms/", "."),
        link("Also read the ", "data deletion procedure", "/en/nexo/data-deletion/", "."),
      ] },
    ],
  },
  terms: {
    title: "Nexo terms and conditions",
    description: "General conditions for accessing and using Nexo's technology services.",
    sections: [
      { title: "Provider identification", blocks: [
        paragraph("Nexo is a technology application of BOSTON BILINGUAL SCHOOL currently under development. Its owner is identified by Peruvian taxpayer number (RUC) 20613627392, with its registered tax address at CAL. SAN ANDRES MZA. U LOTE. 35 URB. SAN ANDRES 1 ERA ETAPA, TRUJILLO, LA LIBERTAD, PERÚ."),
        paragraph("These terms generally govern access to and use of Nexo. Specific commercial conditions may be set out in contracts, proposals or agreements entered into with each client organization."),
      ] },
      { title: "Service description", blocks: [
        paragraph("Nexo is designed to facilitate the receipt, organization, assignment and follow-up of business communications, particularly through authorized integrations with the WhatsApp Business Platform."),
        paragraph("Available features will depend on the implemented version, the contracted plan, permissions granted and integrations enabled."),
        paragraph("Features under development or announced for the future will not be considered available until they are operational."),
      ] },
      { title: "Clients and authorized users", blocks: [
        paragraph("Business access to Nexo is available to organizations that contract for or are authorized to use the service."),
        paragraph("Each client determines which members of its team may access Nexo and which functions they may use, within the controls available."),
        paragraph("Users must protect their credentials and use the tools solely for authorized purposes."),
        paragraph("Clients are responsible for appropriately managing their staff's access."),
      ] },
      { title: "Meta and WhatsApp integrations", blocks: [
        paragraph("Messaging features depend on services provided by Meta and WhatsApp, which are subject to their own terms, requirements, authorizations, policies, charges and availability."),
        paragraph("Boston Bilingual School's onboarding as a Meta technology provider has not yet been approved."),
        paragraph("Nexo does not confer ownership of WhatsApp or guarantee Meta's approval of accounts, telephone numbers, templates or permissions."),
        paragraph("Each client must authorize its accounts and comply with the external platforms' conditions."),
        paragraph("Boston Bilingual School provides an independent technology solution and does not claim to legally represent Meta."),
      ] },
      { title: "Client obligations", blocks: [
        paragraph("Clients undertake to use Nexo lawfully, comply with data protection rules, obtain the authorizations needed for their communications, address their contacts' requests, and avoid misleading or unsolicited communications or communications that violate WhatsApp policies."),
        paragraph("Clients may not use Nexo to access third-party information without authorization, distribute illegal content, impersonate others or compromise other users' security."),
        paragraph("The client is responsible for the legitimacy and accuracy of the information it enters and the instructions it gives its staff."),
      ] },
      { title: "Data and confidentiality", blocks: [
        paragraph("Personal data and communication content managed by each client must be processed in accordance with applicable law, the Nexo privacy policy and the relevant data processing agreements."),
        paragraph("Technical access to client information must be limited to authorized purposes, including operation, maintenance, security and support where applicable."),
        paragraph("Nexo does not transfer ownership of client-provided content to the provider."),
        link("Read the ", "Nexo privacy policy", "/en/nexo/privacy/", "."),
      ] },
      { title: "Commercial terms", blocks: [
        paragraph("Prices, trial periods, included services, renewals, invoicing and payment conditions will be set out in the relevant commercial proposals or agreements."),
        paragraph("Charges arising from external services, including WhatsApp Business Platform messaging, will be identified according to the applicable contracting model."),
        paragraph("Payment for using Nexo does not constitute a separate purchase or resale of Meta's infrastructure."),
      ] },
      { title: "Intellectual property", blocks: [
        paragraph("Boston Bilingual School retains the rights to which it is legally entitled in Nexo, its original components, documentation, design and software."),
        paragraph("The agreement grants the client only the usage rights specified in the relevant contract."),
        paragraph("Third-party elements are governed by their own licenses and terms."),
      ] },
      { title: "Availability and support", blocks: [
        paragraph("Once the service is enabled, Boston Bilingual School will endeavor to maintain Nexo's continuity and proper operation in accordance with the contracted scope."),
        paragraph("Interruptions may occur due to maintenance, technical incidents, connectivity, external providers or decisions made by integrated platforms."),
        paragraph("Specific commitments on availability, response times and service levels must be expressly agreed where applicable."),
      ] },
      { title: "Suspension and termination", blocks: [
        paragraph("Access may be suspended or restricted under the contract and applicable legal obligations, particularly in cases of unauthorized use, security risks or material breaches."),
        paragraph("Cancellation, return or deletion of data will be governed by the relevant agreement, the privacy policy and applicable legal obligations."),
        paragraph("Termination of the service does not necessarily require the immediate deletion of data that must be retained by law."),
      ] },
      { title: "Responsibilities and limitations", blocks: [
        paragraph("Each party is responsible for its respective obligations under applicable law and agreements."),
        paragraph("Boston Bilingual School does not control Meta's or WhatsApp's independent decisions regarding accounts, permissions, restrictions or platform availability."),
        paragraph("Any agreed limitations of liability must comply with applicable law and must not exclude rights that cannot be waived."),
      ] },
      { title: "Changes", blocks: [
        paragraph("These terms may be updated to reflect service needs, technological changes or legal amendments."),
        paragraph("Where required, clients will be informed of material changes through the established channels, and applicable contractual conditions will be respected."),
      ] },
      { title: "Governing law and contact", blocks: [
        paragraph("These terms will be interpreted under applicable Peruvian law, without prejudice to other mandatory rules that may apply."),
        paragraph("For inquiries about Nexo's terms, contact Boston Bilingual School, RUC 20613627392:"),
        link("Contact email: ", nexoContact, nexoEmailHref("Terms inquiry — Nexo"), "."),
        link("Website: ", "https://bostonbbs.com", "https://bostonbbs.com", "."),
        link("Read the ", "Nexo privacy policy", "/en/nexo/privacy/", "."),
        link("Also read the ", "data deletion procedure", "/en/nexo/data-deletion/", "."),
      ] },
    ],
  },
  deletion: {
    title: "Nexo data deletion requests",
    description: "Learn how to request deletion of personal information related to Nexo.",
    sections: [
      { title: "Introduction", blocks: [
        paragraph("Boston Bilingual School provides a way to receive and handle requests concerning the deletion of personal data processed through Nexo, according to the parties' respective responsibilities and applicable law."),
        paragraph("This page explains how to submit a request and how it will be handled based on the person's relationship with the service."),
      ] },
      { title: "Who may submit a request?", blocks: [
        paragraph("Requests may be submitted by:"),
        list([
          "People who communicated with an organization using Nexo.",
          "Authorized staff of a client school or organization.",
          "Authorized representatives of an organization using Nexo.",
          "Other people who believe their personal data is being processed through the service.",
        ]),
        paragraph("Handling the request depends on identifying the data and the applicable legal responsibilities."),
      ] },
      { title: "How to request deletion", blocks: [
        paragraph("To request deletion of personal data related to Nexo, send an email to:"),
        link("", nexoContact, nexoEmailHref("Nexo data deletion request"), "."),
        paragraph("Subject: Nexo data deletion request. In your message, include:"),
        list([
          "Your name or the identification needed to locate the request.",
          "The school or organization you communicated with, where applicable.",
          "The telephone number or email address associated with the data you want deleted.",
          "A brief description of the information you want deleted.",
        ], true),
        paragraph("Do not send passwords, verification codes or sensitive identity documents without being asked."),
        paragraph("We may request only the additional information strictly necessary to verify identity, representation or authorization when appropriate."),
      ] },
      { title: "What happens after a request is received", blocks: [
        paragraph("Boston Bilingual School will review the request to identify the information involved and determine whether it acts as data controller or as a provider processing data on a client's behalf."),
        paragraph("If the data relates to a client school that decides the purposes of processing, the request may need to be referred to or coordinated with that school."),
        paragraph("Where deletion is appropriate, it will be carried out according to the technically available scope, applicable instructions and relevant legal obligations."),
        paragraph("A response will be sent through the contact method provided, within the time limits required by applicable law."),
      ] },
      { title: "Scope and possible limitations", blocks: [
        paragraph("Deletion may cover information stored and managed directly through Nexo, where legally and technically appropriate."),
        paragraph("Some categories of information may be subject to mandatory retention, justified security needs, compliance records or backup procedures."),
        paragraph("Deleting data stored through Nexo does not guarantee deletion of copies lawfully retained by the client school, Meta, WhatsApp or other independent controllers."),
      ] },
      { title: "Revoking access", blocks: [
        paragraph("Where applicable, authorized administrators of client organizations may request the revocation of access and connections associated with Nexo."),
        paragraph("Disconnecting a business account or application and deleting previously processed data are separate processes."),
        paragraph("Revoking Meta permissions does not, by itself, constitute a request to delete information lawfully retained by other controllers."),
      ] },
      { title: "Additional rights", blocks: [
        paragraph("In addition to requesting deletion, individuals may exercise rights of access, rectification, objection and any other rights recognized under applicable data protection law."),
        link("To learn how information is processed, read the ", "Nexo privacy policy", "/en/nexo/privacy/", "."),
      ] },
      { title: "Contact", blocks: [
        paragraph("Organization handling requests: BOSTON BILINGUAL SCHOOL. RUC: 20613627392. Registered tax address: CAL. SAN ANDRES MZA. U LOTE. 35 URB. SAN ANDRES 1 ERA ETAPA, TRUJILLO, LA LIBERTAD, PERÚ."),
        link("Email: ", nexoContact, nexoEmailHref("Nexo data deletion request"), "."),
        paragraph("Requests will be handled under applicable law and the responsibilities of the parties involved."),
      ] },
    ],
  },
};
