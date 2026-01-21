import { HomeIcon, UserRound, Rocket, Headset } from "lucide-react";


export const itemsNavbar = [
  {
    id: 1,
    title: "Inicio",
    icon: <HomeIcon size={25} color="#fff" strokeWidth={1} />,
    link: "/",
  },
  {
    id: 2,
    title: "Sobre Nosotros",
    icon: <UserRound size={25} color="#fff" strokeWidth={1} />,
    link: "#about-us",
  },
  {
    id: 3,
    title: "Nuestros Porjectos",
    icon: <Rocket size={25} color="#fff" strokeWidth={1} />,
    link: "#projects",
  },
  {
    id: 4,
    title: "Contactanos",
    icon: <Headset size={25} color="#fff" strokeWidth={1} />,
    link: "#contact",
  }
];