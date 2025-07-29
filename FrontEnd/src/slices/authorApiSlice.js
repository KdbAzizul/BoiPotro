import { apiSlice } from "./apiSlice";
const AUTHORS_URL = "/api/authors";

export const authorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAuthors: builder.query({
      query: () => AUTHORS_URL,
      providesTags: ["Author"],
    }),
    getAuthorById: builder.query({
      query: (id) => `${AUTHORS_URL}/${id}`,
    }),
    createAuthor: builder.mutation({
      query: (data) => ({
        url: AUTHORS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Author"],
    }),
    updateAuthor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${AUTHORS_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Author"],
    }),
    deleteAuthor: builder.mutation({
      query: (id) => ({
        url: `${AUTHORS_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Author"],
    }),
  }),
});

export const {
  useGetAllAuthorsQuery,
  useGetAuthorByIdQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
} = authorApiSlice;
