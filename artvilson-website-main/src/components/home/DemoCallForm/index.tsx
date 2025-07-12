import React from 'react';
import { motion } from 'framer-motion';
import { FormFields } from './FormFields';
import { FormHeader } from './FormHeader';
import { FormSubmitButton } from './FormSubmitButton';
import { FormFooter } from './FormFooter';
import { SuccessDialog } from './SuccessDialog';
import { useFormState } from './hooks/useFormState';
import { useBlockedState } from './hooks/useBlockedState';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface DemoCallFormProps {
  isDarkMode: boolean;
  formRef?: React.RefObject<HTMLElement>;
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LcuEFErAAAAALEx_t_ZpNeGbl5rqZZGAnDxzfPS';

const DemoFormContent: React.FC<DemoCallFormProps> = ({ isDarkMode, formRef }) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const {
    formData,
    formErrors,
    formSuccess,
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
  } = useFormState({ executeRecaptcha });

  const { blockedUntil, timeRemaining } = useBlockedState(sessionId);

  return (
    <motion.section 
      ref={formRef} 
      className="py-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(90deg, #FF7A00 0%, #FF4D4D 100%)'
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-2xl"
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Get in Touch
              </h2>
              <p className="text-gray-600">
                Leave your message and we'll get back to you shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    required
                  />
                  {touchedFields.name && formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@domain.com"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    required
                  />
                  {touchedFields.email && formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Phone and Website Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="+971 50 123 4567 or +1 999 999 9999"
                    value={formData.phoneNumber || ''}
                    onChange={handlePhoneInput}
                    onBlur={handlePhoneBlur}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    required
                  />
                  {touchedFields.phoneNumber && formErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="businessWebsite" className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="businessWebsite"
                    name="businessWebsite"
                    placeholder="https://example.com"
                    value={formData.businessWebsite || ''}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                  {touchedFields.businessWebsite && formErrors.businessWebsite && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.businessWebsite}</p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Tell us briefly about your needs..."
                  value={formData.message || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-start">
                <motion.button 
                  type="submit"
                  className={`bg-white hover:bg-gray-50 text-black border-2 border-black px-8 py-3 rounded-xl font-medium transition-all ${
                    isButtonDisabled() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 hover:shadow-md'
                  }`}
                  disabled={isButtonDisabled()}
                  whileHover={{ scale: isButtonDisabled() ? 1 : 1.05 }}
                  whileTap={{ scale: isButtonDisabled() ? 1 : 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : blockedUntil !== null && Date.now() < blockedUntil ? (
                    <span>Please Wait {timeRemaining}s</span>
                  ) : (
                    <span>Submit</span>
                  )}
                </motion.button>
              </div>

              {/* Error message */}
              {submitError && (
                <motion.div 
                  className="mt-4 text-red-500 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {submitError}
                </motion.div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </div>

      <SuccessDialog 
        open={submitSuccess} 
        onOpenChange={(open) => {
          if (!open) {
            window.location.reload();
          }
        }}
      />
    </motion.section>
  );
};

const DemoCallForm: React.FC<DemoCallFormProps> = (props) => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      <DemoFormContent {...props} />
    </GoogleReCaptchaProvider>
  );
};

export default DemoCallForm;