import { useState } from 'react';
import { cleanPhoneNumber, formatPhoneForDisplay, validatePhoneNumber } from '@/lib/phone-validation';
import { z } from 'zod';
import { FormData, formSchema } from '../types';

const initialFormData: FormData = {
  name: '',
  email: '',
  businessWebsite: '',
  phoneNumber: '',
  message: ''
};

interface UseFormStateProps {
  executeRecaptcha: ((action?: string) => Promise<string>) | null;
}

export const useFormState = ({ executeRecaptcha }: UseFormStateProps) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const [formSuccess, setFormSuccess] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allTouched = Object.keys(formData).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {});
    setTouchedFields(allTouched);

    const validationResult = formSchema.safeParse({
      ...formData,
      businessWebsite: formData.businessWebsite 
        ? formData.businessWebsite.startsWith('http') 
          ? formData.businessWebsite 
          : `https://${formData.businessWebsite}`
        : ''
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach(issue => {
        errors[issue.path[0] as string] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    if (!executeRecaptcha) {
      setSubmitError('ReCAPTCHA verification is not available. Please try again later.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Отправка в Telegram
      const telegramBotToken = '7769253092:AAF7SVMgAWuMYt51KW8BOWoHBKV3Wi2_xtE';
      const chatId = '7769253092'; // Используем ID бота как временное решение
      
      const message = `
🔔 Новая заявка с сайта!

👤 Имя: ${formData.name}
📧 Email: ${formData.email}
📱 Телефон: ${formData.phoneNumber}
🌐 Сайт: ${formData.businessWebsite || 'Не указан'}
💬 Сообщение: ${formData.message || 'Не указано'}

⏰ Время: ${new Date().toLocaleString('ru-RU')}
      `.trim();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('Telegram response:', response);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send to Telegram: ${response.status} - ${errorData.description || response.statusText}`);
      }

      setSubmitSuccess(true);
      setFormData(initialFormData);
      setFormErrors({});
      setFormSuccess({});
      setTouchedFields({});
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.message === 'Failed to fetch') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to send to Telegram:')) {
        errorMessage = 'Failed to send message. Please try again later.';
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (formErrors[id]) {
      setFormErrors(prev => ({
        ...prev,
        [id]: undefined
      }));
      setFormSuccess(prev => ({
        ...prev,
        [id]: false
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    setTouchedFields(prev => ({
      ...prev,
      [id]: true
    }));

    if (!value) return;
    
    const validation = validatePhoneNumber(value, sessionId);
    
    if (!validation.isValid) {
      setFormErrors(prev => ({
        ...prev,
        [id]: validation.message
      }));
      setFormSuccess(prev => ({
        ...prev,
        [id]: false
      }));
      
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    } else {
      setFormErrors(prev => ({
        ...prev,
        [id]: undefined
      }));
      setFormSuccess(prev => ({
        ...prev,
        [id]: true
      }));
      
      if (validation.formattedNumber) {
        e.target.value = validation.formattedNumber;
        setFormData(prev => ({
          ...prev,
          [id]: validation.formattedNumber
        }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    if (formErrors[id]) {
      setFormErrors(prev => ({
        ...prev,
        [id]: undefined
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    setTouchedFields(prev => ({
      ...prev,
      [id]: true
    }));

    if (!value) return;

    if (id === 'email' && value) {
      const emailResult = z.string().email().safeParse(value);
      if (!emailResult.success) {
        setFormErrors(prev => ({
          ...prev,
          [id]: 'Please enter a valid email address'
        }));
        return;
      }
    }

    if (id === 'businessWebsite' && value) {
      const urlToValidate = value.startsWith('http') ? value : `https://${value}`;
      try {
        const url = new URL(urlToValidate);
        if (!url.hostname.includes('.')) {
          throw new Error('Invalid domain');
        }
        setFormData(prev => ({
          ...prev,
          [id]: urlToValidate
        }));
        setFormErrors(prev => ({
          ...prev,
          [id]: undefined
        }));
      } catch {
        setFormErrors(prev => ({
          ...prev,
          [id]: 'Please enter a valid website URL (e.g., example.com)'
        }));
      }
      return;
    }
  };

  const isButtonDisabled = () => {
    if (isSubmitting) {
      return true;
    }
    
    return Object.values(formErrors).some(error => error !== undefined);
  };

  return {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    formSuccess,
    setFormSuccess,
    isSubmitting,
    submitSuccess,
    submitError,
    touchedFields,
    handleInputChange,
    handlePhoneInput,
    handlePhoneBlur,
    handleBlur,
    handleSubmit,
    isButtonDisabled,
    sessionId
  };
};