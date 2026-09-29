import { unsafePageLinks } from './page-links';

describe('unsafePageLinks', () => {
  it('accepts http(s) links and site paths', () => {
    expect(
      unsafePageLinks({
        P: [{ buttons: [{ label: 'Go', href: '/contact' }] }],
        galery: [{ imagen: 'https://cdn.example.com/a.jpg', video: '' }],
        keywordLink: { drones: 'https://example.com/drones' },
      }),
    ).toEqual([]);
  });

  it('flags script, data and protocol-relative links anywhere in the tree', () => {
    expect(
      unsafePageLinks({
        P: [{ buttons: [{ label: 'x', href: 'javascript:alert(1)' }] }],
        Example: [{ Galeria: [{ urlImg: 'data:text/html,hi' }] }],
        keywordLink: { evil: '//evil.example' },
      }),
    ).toEqual([
      'page.P[0].buttons[0].href',
      'page.Example[0].Galeria[0].urlImg',
      'page.keywordLink.evil',
    ]);
  });
});
