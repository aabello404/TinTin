export type CreateListingDto = {
  name: string;
  description: string;
  categoryId: string;
  sizes: Record<string, number>;
  price?: number;
};

export type UpdateListingDto = Partial<CreateListingDto> & {
  images?: string[];
};
