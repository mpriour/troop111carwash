import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";

import type { Ad } from "~/models/ad.server";
import { editAd, getAd } from "~/models/ad.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  error?: {
    msg: string;
    id: string;
  }
};

type LoaderData = {
  ad: Ad;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  invariant(params.id, "ad not found");

  const ad = await getAd({ id: params.id });
  if (!ad) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ ad });
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  const formData = await request.formData();
  const id = formData.get("id") as string;
  const sponsor = formData.get("sponsor");
  const size = formData.get("size");
  const sponsorUrl = formData.get("sponsorUrl");
  const orient = formData.get("orient");
  const imgUrl = formData.get("imgUrl");
  const year = formData.get("year");

  if (typeof sponsor !== "string" || sponsor.length === 0) {
    return json<ActionData>(
      { error: { msg: "Sponsor is required", id: "sponsor" } },
      { status: 400 }
    );
  }

  if (typeof size !== "string" || size.length === 0) {
    return json<ActionData>(
      { error: { msg: "Size is required", id: "size" } },
      { status: 400 }
    );
  }

  if (typeof orient !== "string" || orient.length === 0) {
    return json<ActionData>(
      { error: { msg: "Orientation is required", id: "orient" } },
      { status: 400 }
    );
  }

  if (typeof imgUrl !== "string" || imgUrl.length === 0) {
    return json<ActionData>(
      { error: { msg: "Image URL is required", id: "imgUrl" } },
      { status: 400 }
    );
  }

  if (typeof year !== "string" || year.length === 0) {
    return json<ActionData>(
      { error: { msg: "Year is required", id: "year" } },
      { status: 400 }
    );
  }

  await editAd({
    id,
    sponsor,
    imgUrl,
    size: parseInt(size),
    year: parseInt(year),
    orient,
    sponsorUrl: (sponsorUrl as string) || ""
  });

  return redirect(`/ads`);
};

export default function EditAdPage() {
  const actionData = useActionData() as ActionData;
  const { ad } = useLoaderData<LoaderData>();

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <input type="hidden" name="id" value={ad.id} />
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Img URL: </span>
          <input
            name="imgUrl"
            defaultValue={ad.imgUrl}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
        {actionData?.error?.id == "imgUrl" ? (
          <div className="pt-1 text-red-700" id="imgUrl-error">
            {actionData.error.msg}
          </div>
        ) : null}
      </div>
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Sponsor: </span>
          <input
            name="sponsor"
            defaultValue={ad.sponsor}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
        {actionData?.error?.id == "sponsor" && (
          <div className="pt-1 text-red-700" id="sponsor-error">
            {actionData.error.msg}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Sponsor URL: </span>
          <input
            name="sponsorUrl"
            defaultValue={ad.sponsorUrl}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Year: </span>
          <input
            name="year"
            defaultValue={ad.year}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
        {actionData?.error?.id == "year" && (
          <div className="pt-1 text-red-700" id="year-error">
            {actionData.error.msg}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Size: </span>
          <select
            name="size"
            defaultValue={ad.size}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          >
            <option value="">Select a size</option>
            <option value="1">SMALL</option>
            <option value="2">MEDIUM</option>
            <option value="3">LARGE</option>
          </select>
        </label>
        {actionData?.error?.id == "size" && (
          <div className="pt-1 text-red-700" id="size-error">
            {actionData.error.msg}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Orientation: </span>
          <select
            name="orient"
            defaultValue={ad.orient}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          >
            <option value="">Choose one</option>
            <option value="l">Landscape</option>
            <option value="p">Portrait</option>
          </select>
        </label>
        {actionData?.error?.id == "orient" && (
          <div className="pt-1 text-red-700" id="orient-error">
            {actionData.error.msg}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
