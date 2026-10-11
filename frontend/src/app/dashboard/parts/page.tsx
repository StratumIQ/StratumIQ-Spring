"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import PageShell from "@/components/dashboard/layout/PageShell";
import ComingSoon from "@/components/dashboard/common/ComingSoon";

  return (
    <PageShell>
      <ComingSoon module="Parts" />
    </PageShell>
  );
}
