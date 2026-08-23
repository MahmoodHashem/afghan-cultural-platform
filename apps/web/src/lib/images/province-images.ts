type ProvinceWithImage = {
  name: string;
  slug: string;
  image?: {
    secureUrl: string;
    thumbnailUrl: string;
    altText: string;
  } | null;
};

const provinceImageBySlug: Record<string, string> = {
  badakhshan: "/images/provinces/badakhshan.jpg",
  badghis: "/images/provinces/badghis.jpg",
  balkh: "/images/provinces/balkh.jpg",
  bamyan: "/images/provinces/bamyan.webp",
  daykundi: "/images/provinces/daikundi.jpg",
  farah: "/images/provinces/farah.jpg",
  faryab: "/images/provinces/faryab.jpeg",
  ghazni: "/images/provinces/ghazni.jpg",
  ghor: "/images/provinces/ghour.jpg",
  helmand: "/images/provinces/helmand.webp",
  herat: "/images/provinces/herat.jpg",
  jowzjan: "/images/provinces/jawzjan.jpeg",
  kabul: "/images/provinces/kabul.jpg",
  kandahar: "/images/provinces/kandahar.jpg",
  nimroz: "/images/provinces/nimroz.jpg",
  paktia: "/images/provinces/paktia.jpg",
  paktika: "/images/provinces/paktika.jpg",
  parwan: "/images/provinces/parwan.jpeg",
  samangan: "/images/provinces/samangan.jpg",
  "sar-e-pol": "/images/provinces/saripul.jpg",
  uruzgan: "/images/provinces/urzgan.jpg",
  wardak: "/images/provinces/wardak.jpg",
  zabul: "/images/provinces/zabul.jpg",
};

const provincePlaceholderImage = "/images/province-placeholder.png";

function getProvinceImage(province: ProvinceWithImage, variant: "detail" | "thumbnail" = "detail") {
  if (province.image) {
    return {
      src: variant === "thumbnail" ? province.image.thumbnailUrl : province.image.secureUrl,
      alt: province.image.altText,
      managed: true,
    };
  }

  const mappedImage = provinceImageBySlug[province.slug];
  if (mappedImage) {
    return { src: mappedImage, alt: `نمای فرهنگی ولایت ${province.name}`, managed: false };
  }

  return {
    src: provincePlaceholderImage,
    alt: "نمایی از میراث فرهنگی افغانستان",
    managed: false,
  };
}

export { getProvinceImage };
