import { apiSlice } from './apiSlice';

export const publisherApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPublishers: builder.query({
      query: () => '/api/publishers',
      providesTags: ['Publisher'],
    }),
    getPublisherById: builder.query({
      query: (id) => `/api/publishers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Publisher', id }],
    }),
    createPublisher: builder.mutation({
      query: (data) => ({
        url: '/api/publishers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Publisher'],
    }),
    updatePublisher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/publishers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Publisher', id },
        'Publisher',
      ],
    }),
    deletePublisher: builder.mutation({
      query: (id) => ({
        url: `/api/publishers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Publisher'],
    }),
  }),
});

export const {
  useGetAllPublishersQuery,
  useGetPublisherByIdQuery,
  useCreatePublisherMutation,
  useUpdatePublisherMutation,
  useDeletePublisherMutation,
} = publisherApiSlice; 