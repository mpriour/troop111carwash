import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

import type { Ad } from "~/models/ad.server";
import { getAds } from "~/models/ad.server";

import { useOptionalUser } from "~/utils";

type LoaderData = { ads: Array<Ad | null> };

const gridPosition = (ad: Ad): string => {
  if (ad.size === 3) {
    return (ad.orient === "p") ? "col-span-2 row-span-2" : "col-span-2 sm:col-span-4 row-span-2";
  }
  if (ad.size === 2) {
    return "col-span-2 row-span-1";
  }
  return "col-span-2 sm:col-span-1";
}

const pickLargeP = (remaining: Ad[], final: Array<Ad | null>) => {
  const info = getAdsBySizeOrient(remaining, 3, "p");
  info.forEach((ndx) => {
    const pick = remaining.splice(ndx, 1);
    final.push(pick[0])
  })
  return info.length;
}

const pickLargeL = (remaining: Ad[], final: Array<Ad | null>) => {
  const info = getAdsBySizeOrient(remaining, 3, "l");
  info.forEach((ndx) => {
    const pick = remaining.splice(ndx, 1);
    final.push(pick[0])
  })
  return info.length;
}

const pickMediumL = (remaining: Ad[], final: Array<Ad | null>) => {
  const info = getAdsBySizeOrient(remaining, 2, "l", 2);
  info.forEach((ndx) => {
    const pick = remaining.splice(ndx, 1);
    final.push(pick[0])
  })
  return info.length;
}

const pickMediumP = (remaining: Ad[], final: Array<Ad | null>) => {
  const info = getAdsBySizeOrient(remaining, 2, "p", 2);
  info.forEach((ndx) => {
    const pick = remaining.splice(ndx, 1);
    final.push(pick[0])
  })
  return info.length;
}

const pickSmallL = (remaining: Ad[], final: Array<Ad | null>) => {
  const info = getAdsBySizeOrient(remaining, 1, "l", 4);
  info.forEach((ndx) => {
    const pick = remaining.splice(ndx, 1);
    final.push(pick[0])
  })
  return info.length;
}

const pickSmallP = (remaining: Ad[], final: Array<Ad | null>) => {
  const info = getAdsBySizeOrient(remaining, 1, "p", 4);
  info.forEach((ndx) => {
    const pick = remaining.splice(ndx, 1);
    final.push(pick[0])
  })
  return info.length;
}

const getAdsBySizeOrient = (ads: Ad[], size: number, orient: string, limit = 1): number[] => {
  const results = [];
  while (results.length < limit) {
    const i = ads.findIndex((ad) => ad.size === size && ad.orient == orient);
    if (i === -1) {
      return results;
    }
    results.push(i);
  }
  return results;
}

const masonrySort = (remaining: Ad[], final: Array<Ad | null>) => {
  const r1count = masonrySortType1(remaining, final);
  const r2count = masonrySortType2(remaining, final);
  if ((r1count > 0 || r2count > 0) && remaining.length > 0) {
    masonrySort(remaining, final);
  }
}

const masonrySortType1 = (remaining: Ad[], final: Array<Ad | null>): number => {
  let c = 0;
  const lpCount = pickLargeP(remaining, final);
  c += lpCount * 8;
  const mlCount = pickMediumL(remaining, final);
  c += mlCount * 4;
  const slCount = pickSmallL(remaining, final);
  c += slCount;
  if (c === 0) {
    return c;
  }
  while (c < 16) {
    final.push(null);
    c++;
  }
  return c;
}

const masonrySortType2 = (remaining: Ad[], final: Array<Ad | null>): number => {
  let c = 0;
  if (pickLargeL(remaining, final) === 1) {
    return 16;
  }
  const mpCount = pickMediumP(remaining, final);
  if (mpCount === 2) {
    return 16;
  } else {
    c += mpCount * 8;
  }
  const spCount = pickSmallP(remaining, final);
  c += spCount * 2;
  if (c === 0) {
    return c;
  } else if (c <= 8) {
    c += (pickSmallP(remaining, final) * 2)
  }
  while (c < 16) {
    final.push(null);
    c++;
  }
  return c;
}

export const loader: LoaderFunction = async () => {
  const sortedAds: Array<Ad | null> = [];
  const ads = await getAds({ year: 2021 });
  masonrySort(ads, sortedAds)
  return json<LoaderData>({
    ads: sortedAds,
  });
};

export default function Index() {
  const data = useLoaderData() as LoaderData;
  const user = useOptionalUser();
  return (
    <>
      <header className="w-full py-6 px-6 bg-yellow-400 flex justify-between items-center gap-x-2">
        {user ?
          <>
          <div>
            <h1 className="text-blue-700">Welcome {user.email}</h1>
          </div>
            <Link to="./ads/new" className="rounded bg-blue-600 py-2 px-4 text-white hover:bg-blue-800 focus:bg-blue-400">Create Ad</Link>
          </> :
          <>
          <div>
            <h1 className="text-blue-700 font-serif text-4xl font-semibold">Troop 111 Car Wash Sponsors</h1>
          </div>
          <div className="text-black font-sans sm:text-lg">
            All proceeds from the car wash help our Troop attend Summer Camp, High Adventure Bases, and other activities
          </div>
          </>
          }
      </header>
      <main className="relative min-h-screen bg-blue-200 sm:flex sm:items-center sm:justify-center px-4">
        <div className="relative sm:pb-16 sm:pt-8">
          <div className="grid auto-rows-[360px] grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
            {data.ads.map((ad, i) => (
              ad === null ? <div key={i}></div> :
                <div key={ad.id} className={`${gridPosition(ad)} rounded p-2 text-center`}>
                  <h3 className="font-sans text-2xl text-gray-700">{ad.sponsor}</h3>
                  <div className="h-[90%]">
                    <img src={ad.imgUrl} alt="" className="h-full mx-auto" />
                  </div>
                  {ad.sponsorUrl.length > 0 ?
                    <p><a href={`http://${ad.sponsorUrl}`} className="cursor-pointer text-blue-600" target="_blank" rel="noreferrer">{ad.sponsorUrl}</a></p> :
                    null
                  }
                </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
