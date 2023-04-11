import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, /* NavLink, Outlet, */ useLoaderData } from "@remix-run/react";

import { Ad, getAds } from "~/models/ad.server";
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

const cloudLimitsUrl = (ad: Ad): string => {
  const parts = ad.imgUrl.split('upload/');
  if (parts.length != 2) { return ad.imgUrl; }
  const crop: string = 'c_fit,w_40,h_40';
  return `${parts[0]}upload/${crop}/${parts[1]}`
}

export const loader: LoaderFunction = async ({ request }) => {
  //const userId = await requireUserId(request);
  let adItems: Ad[];
  const {searchParams} = new URL(request.url);
  if(searchParams.has('year')){
    adItems = await getAds({year:parseInt(searchParams.get('year')!)})
  } else {
    adItems = await getAllAds();
  }
  return json<LoaderData>({ adItems });
};

export default function AdsPage() {
  const { adItems } = useLoaderData<typeof loader>() as LoaderData;
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
          <div className="flex gap-x-4">
            <Link to={`./edit/${ad.id}`}><div className="rounded bg-blue-500 text-white px-3 py-1">Edit</div></Link>
            <Link to={`./${ad.id}`}>{`${yr} - ${i+1}`}</Link>
            <p>{ad.sponsorUrl.length ?
              <a href={ad.sponsorUrl} target="_blank" rel="noreferrer">{ad.sponsor}</a> :
              ad.sponsor
              }
            </p>
            <img src={cloudLimitsUrl(ad)} alt="" className="w-40 h-auto" />
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
