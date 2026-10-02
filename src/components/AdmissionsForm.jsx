import React, { useState } from 'react';

export default function AdmissionsForm({ lang = 'es' }) {
  const [formData, setFormData] = useState({
    studentName: '',
    studentAge: '',
    grade: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    preferredContact: 'phone',
    language: lang,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const labels = {
    es: {
      title: 'Ficha de Postulación Online',
      studentSection: 'Datos del Estudiante',
      studentName: 'Nombre del estudiante',
      studentAge: 'Edad',
      grade: 'Grado al que postula',
      parentSection: 'Datos del Apoderado',
      parentName: 'Nombre completo',
      parentPhone: 'Teléfono',
      parentEmail: 'Correo electrónico',
      preferredContact: 'Medio de contacto preferido',
      phone: 'Teléfono',
      whatsapp: 'WhatsApp',
      submit: 'Enviar Postulación',
      success: '¡Postulación recibida! Nos contactaremos pronto.',
      error: 'Error al enviar la postulación. Intenta nuevamente.',
      required: 'Este campo es obligatorio',
    },
    en: {
      title: 'Online Application Form',
      studentSection: 'Student Information',
      studentName: 'Student name',
      studentAge: 'Age',
      grade: 'Grade applying for',
      parentSection: 'Parent/Guardian Information',
      parentName: 'Full name',
      parentPhone: 'Phone',
      parentEmail: 'Email address',
      preferredContact: 'Preferred contact method',
      phone: 'Phone',
      whatsapp: 'WhatsApp',
      submit: 'Submit Application',
      success: 'Application received! We will contact you soon.',
      error: 'Error sending application. Please try again.',
      required: 'This field is required',
    },
  };

  const t = labels[lang];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.studentName.trim()) {
      setMessage(t.required);
      setMessageType('error');
      return false;
    }
    if (!formData.studentAge.trim()) {
      setMessage(t.required);
      setMessageType('error');
      return false;
    }
    if (!formData.grade.trim()) {
      setMessage(t.required);
      setMessageType('error');
      return false;
    }
    if (!formData.parentName.trim()) {
      setMessage(t.required);
      setMessageType('error');
      return false;
    }
    if (!formData.parentPhone.trim()) {
      setMessage(t.required);
      setMessageType('error');
      return false;
    }
    if (!formData.parentEmail.trim() || !formData.parentEmail.includes('@')) {
      setMessage(t.required);
      setMessageType('error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(t.success);
        setMessageType('success');
        setFormData({
          studentName: '',
          studentAge: '',
          grade: '',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          preferredContact: 'phone',
          language: lang,
        });
      } else {
        setMessage(result.error || t.error);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(t.error);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admissions-form-container">
      <h3 className="form-title">{t.title}</h3>

      <form onSubmit={handleSubmit} className="admissions-form">
        {/* Student Section */}
        <fieldset className="form-section">
          <legend className="section-title">{t.studentSection}</legend>

          <div className="form-group">
            <label htmlFor="studentName">{t.studentName} *</label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="studentAge">{t.studentAge} *</label>
              <input
                type="number"
                id="studentAge"
                name="studentAge"
                value={formData.studentAge}
                onChange={handleChange}
                placeholder="Ej: 10"
                min="5"
                max="18"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="grade">{t.grade} *</label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar grado</option>
                <option value="1">1° Grado</option>
                <option value="2">2° Grado</option>
                <option value="3">3° Grado</option>
                <option value="4">4° Grado</option>
                <option value="5">5° Grado</option>
                <option value="6">6° Grado</option>
                <option value="7">7° Grado</option>
                <option value="8">8° Grado</option>
                <option value="9">9° Grado</option>
                <option value="10">10° Grado</option>
                <option value="11">11° Grado</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Parent Section */}
        <fieldset className="form-section">
          <legend className="section-title">{t.parentSection}</legend>

          <div className="form-group">
            <label htmlFor="parentName">{t.parentName} *</label>
            <input
              type="text"
              id="parentName"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              placeholder="Ej: Carlos García"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="parentPhone">{t.parentPhone} *</label>
              <input
                type="tel"
                id="parentPhone"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                placeholder="+51 976 586 016"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentEmail">{t.parentEmail} *</label>
              <input
                type="email"
                id="parentEmail"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="preferredContact">{t.preferredContact}</label>
            <select
              id="preferredContact"
              name="preferredContact"
              value={formData.preferredContact}
              onChange={handleChange}
            >
              <option value="phone">{t.phone}</option>
              <option value="whatsapp">{t.whatsapp}</option>
              <option value="email">Email</option>
            </select>
          </div>
        </fieldset>

        {/* Message */}
        {message && (
          <div className={`form-message form-message--${messageType}`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Enviando...' : t.submit}
        </button>
      </form>
    </div>
  );
}
