import { FileUpload, parseFormData } from "@mjackson/form-data-parser";
import type { ActionFunction } from "react-router";
import { Form, useActionData } from "react-router";

import { uploadImage } from "~/utils/utils.server";

interface ActionData {
  errorMsg?: string;
  imgSrc?: string;
  imgDesc?: string;
}

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler = async (fileUpload: FileUpload) => {
    if (fileUpload.fieldName !== "img") {
      return;
    }
    
    const uploadedImage = await uploadImage(fileUpload.stream());
    return uploadedImage?.secure_url;
  };

  const formData = await parseFormData(
    request,
    uploadHandler
  );
  const imgSrc = formData.get("img");
  const imgDesc = formData.get("desc");
  if (!imgSrc) {
    return {
      error: "something wrong",
    };
  }
  return {
    imgSrc,
    imgDesc,
  };
};

export default function Index() {
  const data = useActionData<ActionData>();
  return (
    <>
      <Form method="post" encType="multipart/form-data">
        <label htmlFor="img-field">Image to upload</label>
        <input id="img-field" type="file" name="img" accept="image/*" />
        <label htmlFor="img-desc">Image description</label>
        <input id="img-desc" type="text" name="desc" />
        <button type="submit">upload to cloudinary</button>
      </Form>
      {data?.errorMsg ? <h2>{data.errorMsg}</h2> : null}
      {data?.imgSrc ? <>
          <h2>uploaded image</h2>
          <img src={data.imgSrc} alt={data.imgDesc || "Upload result"} />
        </> : null}
    </>
  );
}
