'use client'

export default function Contact() {
  const contacts = [
    {
      name: 'Line',
      url: 'https://line.me/R/ti/p/sagechalongphat',
      icon: '💬',
      desc: 'แชตสอบถามผ่าน LINE'
    },
    {
      name: 'Phone',
      url: 'tel:+66902314495',
      icon: '📞',
      desc: 'โทรสอบถามโดยตรง'
    },
    {
      name: 'Email',
      url: 'mailto:sage20885@gmail.com',
      icon: '✉️',
      desc: 'ส่งอีเมลหาเรา'
    }
  ]

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '30px' }}>
      <h1 style={{ fontSize: '2rem', color: '#167754', marginBottom: '1.5rem' }}>
        ติดต่อเรา
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        {contacts.map((c, idx) => (
          <a
            key={idx}
            href={c.url}
            target="_blank"
            style={{
              textDecoration: 'none',
              color: '#333',
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
              ;(e.currentTarget as HTMLElement).style.boxShadow =
                '0 8px 20px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLElement).style.boxShadow =
                '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '2.5rem', textAlign: 'center' }}>{c.icon}</div>
            <h3 style={{ textAlign: 'center', marginTop: '10px' }}>{c.name}</h3>
            <p
              style={{
                textAlign: 'center',
                fontSize: '0.9rem',
                color: '#666',
                marginTop: '6px'
              }}
            >
              {c.desc}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
