'use client'

export default function Maps() {
  return (
    <div>
      <iframe
        width='100%'
        height='100%'
        className='absolute inset-0'
        frameBorder='0'
        title='map'
        allowFullScreen
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
        style={{ border: 0 }}
        src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31914.032699135856!2d-79.66145773082995!3d0.963596937473504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fd4beb08afdae79%3A0x58e2517154076f6!2sEsmeraldas!5e0!3m2!1ses-419!2sec!4v1720734804686!5m2!1ses-419!2sec'
      />
    </div>
  )
}