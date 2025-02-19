import { Fragment } from "react/jsx-runtime";
import { Link, LoaderFunction, /* NavLink, Outlet, */ useLoaderData } from "react-router";

import type { Ad } from "~/models/ad.server";
//import { requireUserId } from "~/session.server";
import { getAllAds, getAds } from "~/models/ad.server";
import { formatCloudUrl } from "~/utils";

interface LoaderData {
  adItems: Awaited<ReturnType<typeof getAllAds>>;
}
type AdsByYear = Record<number, Ad[]>;

function sizeToString(sz: number) {
  return sz === 3 ? "large" : sz === 2 ? "medium" : "small";
}

export const loader: LoaderFunction = async ({ request }) => {
  //const userId = await requireUserId(request);
  let adItems: Ad[];
  const { searchParams } = new URL(request.url);
  if (searchParams.has("year")) {
    adItems = await getAds({ year: parseInt(searchParams.get("year")!) });
  } else {
    adItems = await getAllAds();
  }
  return { adItems };
};

export default function AdsPage() {
  const { adItems } = useLoaderData<typeof loader>() as LoaderData;
  const adsByYear: AdsByYear = {};
  adItems.forEach((ad) => {
    const { year } = ad;
    if (!adsByYear[year]) {
      adsByYear[year] = [ad];
    } else {
      adsByYear[year].push(ad);
    }
  });
  return (
    <>
      <h2>All Ads By Year</h2>
      {Object.keys(adsByYear).map((yr) => (
        <div key={yr} className="ms-8">
          <Link to={`/year/${yr}`}>
            <h3 className="text-lg font-semibold">{yr}</h3>
          </Link>
          {adsByYear[parseInt(yr)].map((ad, i) => (
            <div key={ad.id} className="grid grid-cols-2 gap-4 w-2/5 my-4 p-2 rounded-md border border-gray-500">
              <div className="flex flex-col gap-y-2 justify-between">
                <Link to={`./${ad.id}`}>{`${yr} - ${i + 1}`}</Link>
                <p>
                  {ad.sponsorUrl.length ? (
                    <a href={ad.sponsorUrl} target="_blank" rel="noreferrer">
                      {ad.sponsor}
                    </a>
                  ) : (
                    ad.sponsor
                  )}
                </p>
                <p>{sizeToString(ad.size)}</p>
                <Link to={`./edit/${ad.id}`}>
                  <div className="rounded bg-blue-500 text-white px-3 py-1 content-start max-w-min">Edit</div>
                </Link>
              </div>
              <img src={formatCloudUrl(ad)} alt="" className="max-w-60" />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
