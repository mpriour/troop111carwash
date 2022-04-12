import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, /* NavLink, Outlet, */ useLoaderData } from "@remix-run/react";

import type { Ad } from "~/models/ad.server";
//import { requireUserId } from "~/session.server";
import { getAllAds } from "~/models/ad.server";

type LoaderData = {
  adItems: Awaited<ReturnType<typeof getAllAds>>;
};
type AdsByYear = {
  [key: number]: Ad[];
}

function sizeToString(sz:number){
 return sz === 3 ? "large" : sz === 2 ? "medium" : "small"
}

export const loader: LoaderFunction = async ({ request }) => {
  //const userId = await requireUserId(request);
  const adItems = await getAllAds();
  return json<LoaderData>({ adItems });
};

export default function AdsPage() {
  const { adItems } = useLoaderData() as LoaderData;
  const adsByYear: AdsByYear = {}
  adItems.forEach((ad) => {
    const {year} = ad;
    if(!adsByYear[year]){
      adsByYear[year] = [ad];
    } else {
      adsByYear[year].push(ad);
    }
  });
  return (
    <>
    <h2>All Ads By Year</h2>
    {Object.keys(adsByYear).map((yr) => (
      <>
      <h3 key={yr}>{yr}</h3>
      <ul>
      {adsByYear[parseInt(yr)].map((ad, i) => (
        <li key={ad.id}>
          <div className="flex">
            <Link to={`./${ad.id}`}>{`${yr} - ${i+1}`}</Link>
            <p>{ad.sponsorUrl.length ?
              <a href={ad.sponsorUrl} target="_blank" rel="noreferrer">{ad.sponsor}</a> :
              ad.sponsor
              }
            </p>
            <img src={ad.imgUrl} alt="" className="aspect-video w-40" />
            <p>{sizeToString(ad.size)}</p>
          </div>
        </li>
      ))}
      </ul>
      </>
    ))}
    </>
  )
}
