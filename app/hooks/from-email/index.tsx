'use client'

import { useRef, useState, FormEvent } from 'react';

import emailjs from '@emailjs/browser';

import { Maps, Button, ToastSuccess, CopyText } from '@/app/utils'

interface LogoProps {
  additionalClasses?: string;
}

export default function From({ additionalClasses = '' }: LogoProps) {

  const [toastText, setToastText] = useState<string>(''); // Estado para almacenar el mensaje de éxito o error
  const [showToast, setShowToast] = useState<boolean>(false);  // Estado para controlar la visibilidad del mensaje
  const form = useRef<HTMLFormElement>(null);
  const [toastVariant, setToastVariant] =
    useState<'success' | 'error' | 'info'>('success');

  const sendEmail = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!form.current) return;

    try {
      const serviceId = `${process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID}`;
      const templateId = `${process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID}`;

      await emailjs.sendForm(serviceId, templateId, form.current);

      setToastText('¡Formulario enviado con éxito!');
      setToastVariant('success');
      setShowToast(true);
      form.current.reset();
    } catch (error) {
      setToastText('No se pudo enviar el formulario');
      setToastVariant('error');
      setShowToast(true);
    }

    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  emailjs.init(`${process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY}`);

  return (
    <section className={`${additionalClasses} body-font relative`}>
      <div className='flex flex-wrap mx-auto sm:flex-nowrap'>

        <div className='relative flex items-end justify-start overflow-hidden rounded-lg lg:w-2/3 md:w-1/2 sm:mr-10 pt-28'>
          <Maps />

          <section className='relative flex flex-wrap py-4 text-white rounded shadow-md dark:bg-honeydew-900 bg-honeydew-800'>
            <div className='px-6 text-sm lg:w-1/2 sm:text-xl'>
              <span className='font-semibold tracking-widest uppercase'>Dirección</span>
              <div>
                <p className='mt-1'>Esmeraldas</p>
                <p className='mt-1'>Calles 9 de octubre n°5 y Av. 2da Simón Bolívar. Mz. 16.</p>
              </div>
            </div>
            <div className='grid px-6 mt-4 text-sm uppercase lg:w-1/2 lg:mt-0 sm:text-xl'>
              <div className='grid'>
                <span className='font-semibold tracking-widest'>EMAIL</span>
                <CopyText style='sm:text-xl text-sm text-left' value='contacto@joaobarres.dev' toastText='Correo Copiado Correctamente' />
              </div>
              <div className='grid'>
                <span className='mt-4 font-semibold tracking-widest'>Celular</span>
                <CopyText style='sm:text-xl text-sm text-left' value='+593 98 666 0737' toastText='Telefono Copiado Correctamente' />
              </div>
            </div>
          </section>

        </div>

        <form ref={form} onSubmit={sendEmail} id='contacto' className='flex flex-col w-full mt-8 text-white lg:w-1/3 md:w-1/2 md:ml-auto md:py-8 md:mt-0'>

          <section className='px-3'>
            <span className='mb-1 text-lg font-bold title-font'>Area De Contacto</span>
            <p className='mb-5 leading-relaxed text-justify'>Ofrecemos soluciones integrales que garantizan un mantenimiento óptimo y seguro de embarcaciones.</p>
          </section>

          <section className='px-2 bg-honeydew-800 rounded-2xl'>
            <fieldset className='relative mb-4'>
              <label htmlFor='name' className='text-sm font-bold leading-7'>Nombres y Apellidos</label>
              <input required placeholder='Joao A********' type='text' id='name' name='name' className='w-full px-3 py-2 rounded bg-honeydew-900' />
            </fieldset>
            <fieldset className='relative mb-4'>
              <label htmlFor='number' className='text-sm font-bold leading-7'>Celular</label>
              <input
                type='text'
                id='number'
                name='number'
                pattern='[0-9]*'
                maxLength={10}
                required
                placeholder='0987654321'
                className='w-full px-3 py-2 rounded bg-honeydew-900'
              />
            </fieldset>
            <fieldset className='relative mb-4'>
              <label htmlFor='email' className='text-sm font-bold leading-7'>Correo</label>
              <input
                required
                type='email'
                id='email'
                name='email'
                placeholder='mail@mail.com'
                className='w-full px-3 py-2 rounded bg-honeydew-900'
              />
            </fieldset>
            <fieldset className='relative mb-4'>
              <label htmlFor='message' className='text-sm font-bold leading-7'>Mensaje</label>
              <textarea
                required
                id='message'
                name='message'
                placeholder='Mensaje'
                className='w-full h-32 px-3 py-2 rounded bg-honeydew-900'
              />
            </fieldset>

            {showToast && (
              <ToastSuccess
                text={toastText}
                variant={toastVariant} // 'success' | 'error' | 'info'
                onClose={() => setShowToast(false)}
              />
            )}
            <Button
              icon=''
              text='Enviar'
              style='justify-center transition duration-500 bg-honeydew-900 hover:bg-white text-white hover:text-black dark:hover:text-white dark:bg-white dark:hover:bg-honeydew-900 dark:text-black font-bold py-2 px-6 rounded text-lg w-full cursor-pointer'
            />
          </section>

        </form>
      </div>
    </section>
  )
}