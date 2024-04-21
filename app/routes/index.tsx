import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

import type { Ad } from "~/models/ad.server";
import { getAds } from "~/models/ad.server";

import { useOptionalUser } from "~/utils";

type LoaderData = {
  splitAds: {
    small: Array<Ad>;
    medium: Array<Ad>;
    large: Array<Ad>;
  }
};

const TARGET_YEAR = 2024;

const pickSmall = (remaining: Ad[], final: Array<Ad>) => {
  const info = getAdsBySizeOrient(remaining, 1);
  info.forEach((ndx) => {
    const pick = remaining.splice(ndx, 1);
    final.push(pick[0])
  })
  return info.length;
}

const pickMedium = (remaining: Ad[], final: Array<Ad>) => {
  const info = getAdsBySizeOrient(remaining, 2);
  info.forEach((ndx) => {
    const pick = remaining.splice(ndx, 1);
    final.push(pick[0])
  })
  return info.length;
}

const pickLarge = (remaining: Ad[], final: Array<Ad>) => {
  const info = getAdsBySizeOrient(remaining, 3);
  info.forEach((ndx) => {
    const pick = remaining.splice(ndx, 1);
    final.push(pick[0])
  })
  return info.length;
}

const getAdsBySizeOrient = (ads: Ad[], size: number, orient?: string, limit = 1): number[] => {
  const results = [];
  while (results.length < limit) {
    const i = ads.findIndex((ad) => ad.size === size && (orient ? ad.orient == orient : true));
    if (i === -1) {
      return results;
    }
    results.push(i);
  }
  return results;
}

const getSmalls = (remaining: Ad[]) => {
  const arr: Array<Ad> = [];
  while (pickSmall(remaining, arr) > 0) {
    continue;
  }
  return arr;
}

const getMediums = (remaining: Ad[]) => {
  const arr: Array<Ad> = [];
  while (pickMedium(remaining, arr) > 0) {
    continue;
  }
  return arr;
}

const getLarges = (remaining: Ad[]) => {
  const arr: Array<Ad> = [];
  while (pickLarge(remaining, arr) > 0) {
    continue;
  }
  return arr;
}

const cloudLimitsUrl = (ad: Ad): string => {
  const parts = ad.imgUrl.split('upload/');
  if (parts.length != 2) { return ad.imgUrl; }
  let crop: string = 'c_fit,f_auto';
  switch (ad.size) {
    case 1:
      crop += ',w_250,h_250';
      break;
    case 2:
      crop += (ad.orient == 'l' ? ',w_400' : ',h_380');
      break;
    case 3:
      crop += (ad.orient == 'l' ? ',w_800' : ',h_760');
      break;
    default:
      break;
  }
  return `${parts[0]}upload/${crop}/${parts[1]}`
}

const masonryStyles = (ad: Ad): string => {
  let cn = 'mx-auto';
  if (ad.size === 3) {
    cn += (ad.orient == 'p' ? ' max-w-full max-h-full' : ' h-full');
  }
  else if (ad.size === 2) {
    cn += (ad.orient == 'p' ? ' max-w-full max-h-[100px] sm:max-h-full' : ' max-h-full');
  }
  return cn;
}

const gridPosition = (ad: Ad): string => {
  if (ad.size === 3) {
    return (ad.orient === "p") ? "col-span-2 row-span-2 sm:col-span-1" : "col-span-2 row-span-1 sm:row-span-2";
  }
  if (ad.size === 2) {
    return "col-span-1 row-span-1";
  }
  return "";
}

const randomize = () => Math.round(Math.random()*3) - Math.round(Math.random()*3)

export const loader: LoaderFunction = async () => {
  const ads = await getAds({ year: TARGET_YEAR });
  return json<LoaderData>({
    splitAds: {
      small: getSmalls(ads).sort(randomize),
      medium: getMediums(ads).sort(randomize),
      large: getLarges(ads).sort(randomize),
    }
  });
};

export default function Index() {
  const data = useLoaderData<typeof loader>() as LoaderData;
  const user = useOptionalUser();
  return (
    <>
      <header className="relative w-full py-3 px-2 sm:p-6 bg-yellow-400 flex justify-between items-center gap-x-2">
        {user ?
          <>
            <div>
              <h1 className="text-blue-700">Welcome {user.email}</h1>
            </div>
            <Link to="./ads/new" className="rounded bg-blue-600 py-2 px-4 text-white hover:bg-blue-800 focus:bg-blue-400">Create Ad</Link>
          </> :
          <>
            <div className="text-center basis-full">
              <h1 className="text-blue-700 font-serif text-lg md:text-4xl font-semibold">
                <img className="md:inline-block md:w-16 md:mr-4 w-6 mx-auto" src="https://res.cloudinary.com/kestrel1337/image/upload/t_media_lib_thumb/v1650305469/t111cw/cropped_logo_j147y5.jpg" alt="Troop 111 Kerrville logo" />
                Troop 111 Car Wash Sponsors
              </h1>
            </div>
            <div className="text-black font-sans md:text-lg">
              All proceeds from the car wash help our Troop attend Summer Camp, High Adventure Bases, and other activities
            </div>
          </>
        }
      </header>
      <main className="relative min-h-screen bg-blue-200 sm:flex sm:items-center sm:justify-center px-4">
        <div className="relative sm:pb-16 sm:pt-8">
          <div className="grid grid-cols-[75px_1fr] gap-2 md:grid-cols-[300px_1fr] sm:gap-4">
            <div className="sidebar">
              {data.splitAds.small.map((smAd) => (
                <div key={smAd.id} className="text-center my-2 sm:my-4">
                  {smAd.sponsorUrl.length > 0 ? (
                    <a href={`http://${smAd.sponsorUrl}`} className="underline decoration-blue-800">
                      <h3 className="font-sans font-semibold text-xs md:text-lg text-blue-800">{smAd.sponsor}</h3>
                      <div className="max-h-[250px]">
                        <img src={cloudLimitsUrl(smAd)} alt={smAd.sponsor} className="mx-auto max-h-full max-w-full" />
                      </div>
                    </a>
                  ) : (<>
                    <h3 className="font-sans font-semibold text-xs md:text-lg text-gray-700">{smAd.sponsor}</h3>
                    <div className="max-h-[250px]">
                      <img src={cloudLimitsUrl(smAd)} alt={smAd.sponsor} className="mx-auto max-h-full max-w-full" />
                    </div>
                  </>)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 auto-rows-[150px] gap-2 sm:auto-rows-[400px] sm:gap-4">
              {data.splitAds.large.map((ad, i) => (
                <>
                <div className={`text-center my-2 sm:my-0 ${gridPosition(ad)}`} key={ad.id ?? i}>
                  {ad.sponsorUrl.length > 0 ? (
                    <a href={`http://${ad.sponsorUrl}`} className="underline decoration-blue-800">
                      <h3 className="font-sans text-sm font-semibold md:text-2xl text-blue-800">{ad.sponsor}</h3>
                      <div className="h-[90%]">
                        <img src={cloudLimitsUrl(ad)} alt={ad.sponsor} className={masonryStyles(ad)} />
                      </div>
                    </a>
                  ) : (<>
                    <h3 className="font-sans text-sm font-semibold md:text-2xl text-gray-700">{ad.sponsor}</h3>
                    <div className="h-[90%]">
                      <img src={cloudLimitsUrl(ad)} alt={ad.sponsor} className={masonryStyles(ad)} />
                    </div>
                  </>)}
                </div>
                {data.splitAds.medium.splice(0,2).map((mdAd, p) => (
                  <div className={`text-center my-2 sm:my-0 ${gridPosition(mdAd)}`} key={mdAd.id ?? p}>
                  {mdAd.sponsorUrl.length > 0 ? (
                    <a href={`http://${mdAd.sponsorUrl}`} className="flex flex-col h-full underline decoration-blue-800">
                      <h3 className="font-sans text-sm font-semibold md:text-2xl text-blue-800">{mdAd.sponsor}</h3>
                      <div className="flex h-full">
                        <img src={cloudLimitsUrl(mdAd)} alt={mdAd.sponsor} className={`my-auto ${masonryStyles(mdAd)}`} />
                      </div>
                    </a>
                  ) : (<div className="flex flex-col h-full">
                    <h3 className="font-sans text-sm font-semibold md:text-2xl text-gray-700">{mdAd.sponsor}</h3>
                    <div className="flex h-full">
                      <img src={cloudLimitsUrl(mdAd)} alt={mdAd.sponsor} className={`my-auto ${masonryStyles(mdAd)}`} />
                    </div>
                  </div>)}
                </div>
                ))}
                </>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
