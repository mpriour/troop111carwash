import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Ad } from "~/models/ad.server";
import { deleteAd } from "~/models/ad.server";
import { getAd } from "~/models/ad.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  ad: Ad;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  invariant(params.adId, "adId not found");

  const ad = await getAd({ id: params.adId });
  if (!ad) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ ad });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  invariant(params.adId, "adId not found");

  await deleteAd({ id: params.adId });

  return redirect("/ads");
};

export default function AdDetailsPage() {
  const {ad} = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{ad.sponsor}</h3>
      <img src={ad.imgUrl} alt={ad.sponsor} className="my-4" />
      <label className="my-4">Sponsor Url : {ad.sponsorUrl.length ? <a href={ad.sponsorUrl} target="_blank" rel="noreferrer">{ad.sponsorUrl}</a> : null}</label>
      <label className="my-4">Size : {ad.size}</label>
      <label className="my-4">Year : {ad.year}</label>
      <label className="my-4">Updated : {ad.updatedAt}</label>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Ad not found</div>;
  }
  if (caught.status === 401) {
    return <div>Logged in user required</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
