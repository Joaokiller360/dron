import Footer from './footer'
import Logos from './logos';
import Inicio from './home';
import About from './about';
import WhatDeDo from './whatDeDo';
import WhyChooseUs from './whyChooseUs';
import Galery from './galery';
import CallAction from './call-action';
import {
  SiteHeader,
  SiteFooter,
  PageHero,
  Eyebrow,
  SectionTitle,
  Shot,
  usePrefix,
} from './site';
import ContactForm from './site/ContactForm';
import LiveRefresh from './site/LiveRefresh';
import { fetchPublic, localized, storeHeader, getContactInfo, getStoreEnabled, whatsappUrl } from './site/api';
import { ContactInfoProvider, useContactInfo } from './site/ContactInfo';
import type { ContactInfo, PublicService, PublicProject, PublicClient, PublicPromotions, PublicTestimonial, PublicProduct, PublicStore } from './site/api';
import { btnPrimary, btnGhost, inputClass } from './site/styles';
import { videoSource, videoThumbnail, projectVideoUrl, projectCover } from './site/video';
import type { VideoSource } from './site/video';
import ProjectShot from './site/ProjectShot';

export {
  Footer,
  Logos,
  Inicio,
  About,
  WhatDeDo,
  WhyChooseUs,
  Galery,
  CallAction,
  SiteHeader,
  SiteFooter,
  PageHero,
  Eyebrow,
  SectionTitle,
  Shot,
  usePrefix,
  ContactForm,
  LiveRefresh,
  fetchPublic,
  localized,
  storeHeader,
  btnPrimary,
  btnGhost,
  inputClass,
  getContactInfo,
  getStoreEnabled,
  whatsappUrl,
  ContactInfoProvider,
  useContactInfo,
  videoSource,
  videoThumbnail,
  projectVideoUrl,
  projectCover,
  ProjectShot,
};

export type { VideoSource, ContactInfo, PublicService, PublicProject, PublicClient, PublicPromotions, PublicTestimonial, PublicProduct, PublicStore };
