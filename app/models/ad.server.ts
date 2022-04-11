import type { Ad } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Ad } from "@prisma/client";

export function getAd({
  id
}: Pick<Ad, "id">) {
  return prisma.ad.findFirst({
    where: { id },
  });
}

export function getAds({ year }: { year: Ad["year"] }) {
  return prisma.ad.findMany({
    where: { year },
    orderBy: { updatedAt: "desc" },
  });
}

export function getAllAds() {
  return prisma.ad.findMany()
}

export function getYears() {
  return prisma.ad.groupBy({
    by: ["year"],
    orderBy: {
      year: "asc"
    },
    _count:{
      _all: true
    }
  })
}

export function createAd({
  sponsor,
  imgUrl,
  size,
  year,
  sponsorUrl
}: Pick<Ad, "sponsor"|"imgUrl"|"sponsorUrl"|"size"|"year">
) {
  return prisma.ad.create({
    data: {
      sponsor,
      imgUrl,
      size,
      year,
      sponsorUrl
    },
  });
}

export function deleteAd({
  id,
}: Pick<Ad, "id">) {
  return prisma.ad.deleteMany({
    where: { id },
  });
}
