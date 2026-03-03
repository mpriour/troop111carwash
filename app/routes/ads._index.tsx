import type { ActionFunction, LoaderFunction } from "react-router";
import { Form, Link, data, redirect, useLoaderData, useSearchParams } from "react-router";

import { createAd, getAd, getAds, getYears } from "~/models/ad.server";
import { requireUserId } from "~/session.server";
import { formatCloudUrl } from "~/utils";

interface ActionData {
  formError?: string;
}

function sizeToString(size: number) {
  if (size === 3) return "Large";
  if (size === 2) return "Medium";
  return "Small";
}

function toSponsorHref(rawUrl: string) {
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  return `https://${rawUrl}`;
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const yearRows = await getYears();
  const years = yearRows.map((row) => row.year).sort((a, b) => b - a);

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const parsedYear = yearParam ? Number.parseInt(yearParam, 10) : Number.NaN;
  const selectedYear = Number.isNaN(parsedYear) ? years[0] ?? null : parsedYear;

  const adItems = selectedYear === null ? [] : await getAds({ year: selectedYear });

  return { adItems, selectedYear, years };
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const currentYear = new Date().getFullYear();

  if (intent !== "duplicate") {
    return data<ActionData>({ formError: "Invalid action." }, { status: 400 });
  }

  const adId = formData.get("adId");
  if (typeof adId !== "string" || !adId) {
    return data<ActionData>({ formError: "Missing ad to duplicate." }, { status: 400 });
  }

  const sourceAd = await getAd({ id: adId });
  if (!sourceAd) {
    return data<ActionData>({ formError: "Ad not found." }, { status: 404 });
  }

  const duplicated = await createAd({
    sponsor: sourceAd.sponsor,
    imgUrl: sourceAd.imgUrl,
    size: sourceAd.size,
    orient: sourceAd.orient,
    sponsorUrl: sourceAd.sponsorUrl,
    year: currentYear,
  });

  return redirect(`/ads?year=${currentYear}`);
};

export default function AdsDashboardPage() {
  const { adItems, selectedYear, years } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const selectedParam = searchParams.get("year");
  const isShowingFallbackYear = !selectedParam && selectedYear !== null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Ad Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              View ads by year, duplicate an ad into next year, or add a new one.
            </p>
          </div>
          <Link
            to="/ads/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create New Ad
          </Link>
        </div>

        {years.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-700">No ads exist yet. Create your first ad to get started.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {years.map((year) => {
                const active = year === selectedYear;
                return (
                  <Link
                    key={year}
                    to={`/ads?year=${year}`}
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      active
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {year}
                  </Link>
                );
              })}
            </div>

            <div className="mb-5 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-900">
              {selectedYear !== null ? (
                <>
                  Showing {adItems.length} ad{adItems.length === 1 ? "" : "s"} for {selectedYear}.
                  {isShowingFallbackYear ? " (Latest available year selected automatically.)" : ""}
                </>
              ) : (
                "No year selected."
              )}
            </div>

            {adItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-700">
                  No ads found for {selectedYear}. Use Create New Ad to add one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {adItems.map((ad) => (
                  <article key={ad.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <img src={formatCloudUrl(ad)} alt={ad.sponsor} className="bg-gray-100 object-contain p-2" />
                    <div className="space-y-3 p-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{ad.sponsor}</h2>
                        <p className="text-xs text-gray-500">
                          {ad.year} • {sizeToString(ad.size)} •{" "}
                          {ad.orient === "l" ? "Landscape" : ad.orient === "p" ? "Portrait" : ad.orient}
                        </p>
                      </div>

                      {ad.sponsorUrl ? (
                        <a
                          href={toSponsorHref(ad.sponsorUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-sm text-blue-700 hover:underline"
                        >
                          Visit Sponsor Site
                        </a>
                      ) : null}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Link
                          to={`/ads/${ad.id}`}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-gray-400"
                        >
                          View
                        </Link>
                        <Link
                          to={`/ads/edit/${ad.id}`}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-gray-400"
                        >
                          Edit
                        </Link>
                        <Form method="post">
                          <input type="hidden" name="intent" value="duplicate" />
                          <input type="hidden" name="adId" value={ad.id} />
                          <button
                            type="submit"
                            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                          >
                            Duplicate to current year
                          </button>
                        </Form>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
