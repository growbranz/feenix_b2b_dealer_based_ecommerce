"use server"

import { revalidatePath } from "next/cache"

export async function revalidateCategoryPages() {
  revalidatePath("/")
  revalidatePath("/categories")
  revalidatePath("/admin/categories")
}
