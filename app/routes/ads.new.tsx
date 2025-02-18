import { FileUpload, parseFormData } from "@mjackson/form-data-parser";
import type { ActionFunction } from "react-router";
import { redirect, Form, useActionData, data } from "react-router";

import { DEFAULT_YEAR } from "~/constants";
import { createAd } from "~/models/ad.server";
import { requireUserId } from "~/session.server";
import { uploadImage } from "~/utils/utils.server";

interface ActionData {
  imgSrc?: string;
  error?: {
    msg: string;
    id: string;
  };
}

const uploadHandler = async (fileUpload: FileUpload) => {
  if (fileUpload.fieldName !== "img") {
    return;
  }
  try {
    const uploadedImage = await uploadImage(fileUpload.stream());
    return uploadedImage?.secure_url;
  } catch (e) {
    console.error(e);
    return;
  }
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  let formData;
  if (request.headers.get("Content-Type")?.includes("multipart")) {
    formData = await parseFormData(request, uploadHandler);
  } else {
    formData = await request.formData();
  }
  if (formData.get("action") === "create") {
    const sponsor = formData.get("sponsor");
    const size = formData.get("size");
    const sponsorUrl = formData.get("sponsorUrl");
    const orient = formData.get("orient");
    const imgUrl = formData.get("imgUrl");
    const year = formData.get("year");

    if (typeof sponsor !== "string" || sponsor.length === 0) {
      return data<ActionData>(
        { error: { msg: "Sponsor is required", id: "sponsor" } },
        { status: 400 }
      );
    }

    if (typeof size !== "string" || size.length === 0) {
      return data<ActionData>({ error: { msg: "Size is required", id: "size" } }, { status: 400 });
    }

    if (typeof orient !== "string" || orient.length === 0) {
      return data<ActionData>(
        { error: { msg: "Orientation is required", id: "orient" } },
        { status: 400 }
      );
    }

    if (typeof imgUrl !== "string" || imgUrl.length === 0) {
      return data<ActionData>(
        { error: { msg: "Image URL is required", id: "imgUrl" } },
        { status: 400 }
      );
    }

    if (typeof year !== "string" || year.length === 0) {
      return data<ActionData>({ error: { msg: "Year is required", id: "year" } }, { status: 400 });
    }

    await createAd({
      sponsor,
      imgUrl,
      size: parseInt(size),
      year: parseInt(year),
      orient,
      sponsorUrl: (sponsorUrl as string) || ""
    });

    return redirect(`/ads`);
  } else if (formData.get("action") === "upload") {
    const imgSrc = formData.get("img");
    if (!imgSrc) {
      return {
        error: { msg: "something went wrong with image upload", id: "img_upload" }
      };
    }
    return {
      imgSrc: imgSrc as string
    };
  }
};

export default function NewAdPage() {
  const actionData = useActionData() as ActionData;

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%"
      }}
    >
      {!actionData?.imgSrc || actionData?.error?.id === "img_upload" ? (
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Image to Upload: </span>
            <input type="file" name="img" id="img_upload" accept="image/*" />
            <button
              type="submit"
              name="action"
              value="upload"
              formEncType="multipart/form-data"
              className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Upload to Cloudinary
            </button>
          </label>
          {actionData?.error?.id == "img_upload" ? <div className="pt-1 text-red-700" id="img_upload-error">
              {actionData.error.msg}
            </div> : null}
        </div>
      ) : (
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Img URL: </span>
            <input
              name="imgUrl"
              value={actionData.imgSrc}
              readOnly={true}
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            />
          </label>
          {actionData?.error?.id == "imgUrl" ? (
            <div className="pt-1 text-red-700" id="imgUrl-error">
              {actionData.error.msg}
            </div>
          ) : (
            <div>
              <img src={actionData.imgSrc} alt="" />
            </div>
          )}
        </div>
      )}
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Sponsor: </span>
          <input
            name="sponsor"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
        {actionData?.error?.id == "sponsor" ? (
          <div className="pt-1 text-red-700" id="sponsor-error">
            {actionData.error.msg}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Sponsor URL: </span>
          <input
            name="sponsorUrl"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Year: </span>
          <input
            name="year"
            defaultValue={DEFAULT_YEAR}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
        {actionData?.error?.id == "year" ? (
          <div className="pt-1 text-red-700" id="year-error">
            {actionData.error.msg}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Size: </span>
          <select
            name="size"
            defaultValue={""}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          >
            <option value="">Select a size</option>
            <option value="1">SMALL</option>
            <option value="2">MEDIUM</option>
            <option value="3">LARGE</option>
          </select>
        </label>
        {actionData?.error?.id == "size" ? (
          <div className="pt-1 text-red-700" id="size-error">
            {actionData.error.msg}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Orientation: </span>
          <select
            name="orient"
            defaultValue={""}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          >
            <option value="">Choose one</option>
            <option value="l">Landscape</option>
            <option value="p">Portrait</option>
          </select>
        </label>
        {actionData?.error?.id == "orient" ? (
          <div className="pt-1 text-red-700" id="orient-error">
            {actionData.error.msg}
          </div>
        ) : null}
      </div>

      <div className="text-right">
        <button
          type="submit"
          name="action"
          value="create"
          formEncType="application/x-www-form-urlencoded"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
