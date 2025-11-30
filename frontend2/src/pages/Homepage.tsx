import CardNav from '@/components/react-bits/CardNav';
import DotGrid from '@/components/react-bits/DotGrid';

const Homepage = () => {
  const items = [
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [{ label: "Me", ariaLabel: "About Me", href: "https://github.com/crunchydosa123/" }]
    },
    {
      label: "Contact",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Email", ariaLabel: "Email us", href: "mailto:prathamgadkari@gmail.com" },
        { label: "GitHub", ariaLabel: "GitHub", href: "https://github.com/crunchydosa123/" },
        { label: "LinkedIn", ariaLabel: "LinkedIn", href: "https://www.linkedin.com/in/pratham-gadkari/" },
        { label: "Twitter", ariaLabel: "Twitter", href: "https://x.com/prathamg_11" }
      ]
    }
  ];

  return (
    <div style={{ width: '100%', height: '900px', position: 'relative' }}>
      <CardNav
        logoAlt="Company Logo"
        items={items}
        baseColor="#fff"
        menuColor="#000"
        buttonBgColor="#111"
        buttonTextColor="#fff"
        ease="power3.out"
      />

      {/* DotGrid as the background */}
      <DotGrid
        dotSize={5}
        gap={15}
        baseColor="#bdbdbdff"
        activeColor="#232322ff"
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
      />

      {/* Hero Section on top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '700px',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10, // higher than DotGrid
          pointerEvents: 'none', // optional, allows DotGrid interactions through hero
          color: '#000000ff',
          textAlign: 'center',
        }}
        className='flex flex-col'
      >

        <div className='rounded-full bg-white/30 backdrop-blur-md border border-gray-500 p-2 text-lg'>Welcome to MindGrid</div>
        <div className=' rounded-full  border-gray-500 p-2 text-7xl mt-5 font-semibold'>A Repository for your thoughts</div>
      </div>
    </div>
  );
};

export default Homepage;
