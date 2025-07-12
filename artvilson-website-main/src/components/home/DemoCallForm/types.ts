import { z } from 'zod';
import { phoneNumberSchema } from '@/lib/phone-validation';

export interface FormData {
  name: string;
  email: string;
  businessWebsite: string;
  phoneNumber: string;
  message: string;
}

export const formFields = [
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Your name',
    required: true
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'your.email@example.com',
    required: true
  },
  {
    id: 'businessWebsite',
    label: 'Business Website (Optional)',
    type: 'url',
    placeholder: 'https://your-business.com',
    required: false
  },
  {
    id: 'phoneNumber',
    label: 'Phone Number',
    type: 'tel',
    placeholder: '(234) 567-8901',
    required: true
  },
  {
    id: 'message',
    label: 'Message',
    type: 'textarea',
    placeholder: 'Tell us briefly about your needs...',
    required: false
  }
];

// Validation schema
export const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  businessWebsite: z.string()
    .transform(val => val.startsWith('http') ? val : `https://${val}`)
    .pipe(z.string().url({ message: 'Please enter a valid website URL' }))
    .optional()
    .or(z.literal('')),
  phoneNumber: phoneNumberSchema,
  message: z.string().optional()
});