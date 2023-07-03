import { useState, useEffect, useCallback } from "react";
import { useContractCall } from "@/hooks/contract/useContractRead";
import Review from "./Review";

import ReactPaginate from "react-paginate";
import AddReview from "./AddReview";

import { Dispatch, SetStateAction } from "react";

interface AllowReviewAction {
  canReview: boolean;
  reviewed: boolean;
}

interface ReviewsProps {
  id: number;
  reviewsLength: number;
  openConnectModal: (() => void) | undefined;
  setLoading: Dispatch<SetStateAction<string>>;
  clear: () => void;
  address: `0x${string}`;
  setError: Dispatch<SetStateAction<string>>;
}

function Reviews({
  id,
  reviewsLength,
  setLoading,
  openConnectModal,
  address,
  clear,
  setError,
}: ReviewsProps) {
  const [visible, setVisible] = useState(false);
  const [showReviewFrom, setShowReviewForm] = useState(false);

  const [reviewsPerPage] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);

  // ReviewId to start fetchings reviews for a certain page. It is 0 by default for page 1
  const [offset, setOffset] = useState(0);

  // Define a function to return the Reviews
  const getReviews = () => {
    // If there are no reviews, return null

    if (!reviewsLength) return null;
    const _reviews = [];
    let fetchAmount =
      reviewsPerPage * currentPage > reviewsLength
        ? reviewsLength
        : reviewsPerPage * currentPage;
    // Dynamically fetch reviews based off the currentPage and the reviewsPerPage values
    for (let i = offset; i < fetchAmount; i++) {
      _reviews.push(
        <Review
          key={`productReviewId-${id}-${i}`}
          productId={id}
          reviewId={i}
          clear={clear}
          openConnectModal={openConnectModal}
          setError={setError}
          setLoading={setLoading}
          address={address}
        />
      );
    }
    return _reviews;
  };

  const { data: rawAllowReviewAction }: any = useContractCall(
    "getProductReviewActions",
    [Number(id)],
    true,
    address
  );
  const [reviewActions, setRevuewActions] = useState<AllowReviewAction | null>(
    null
  );

  // Format the fetched AllowReviewAction struct's data for the connected wallet
  const getFormatReviewAction = useCallback(() => {
    if (!rawAllowReviewAction) return null;
    setRevuewActions({
      canReview: rawAllowReviewAction[0],
      reviewed: rawAllowReviewAction[1],
    });
  }, [rawAllowReviewAction]);

  // Call the getFormatProduct function when the rawProduct state changes
  useEffect(() => {
    getFormatReviewAction();
  }, [getFormatReviewAction]);

  if (!reviewActions) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="mt-4 h-14 w-full border-[1px] border-gray-500 text-black p-2 rounded-lg hover:bg-black hover:text-white"
        data-bs-toggle={`modal-reviews-${id}`}
        data-bs-target="#exampleModalCenter"
      >
        Reviews
      </button>
      {visible && (
        <div
          className="fixed z-40 overflow-y-auto top-0 w-full left-0 max-h-screen"
          id="modal-reviews-${id}"
        >
          {/* Modal body */}

          <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-900 opacity-75" />
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div
              className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              {/* Renders all reviews of product and implement paginations if conditions are true */}
              {/* Otherwise, the add review form is rendered */}
              {!showReviewFrom && reviewsLength > 0 ? (
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  {getReviews()}
                  <ReactPaginate
                    onPageChange={({ selected }) => {
                      setOffset(selected * reviewsPerPage);
                      setCurrentPage(selected + 1);
                    }}
                    containerClassName={"pagination"}
                    pageLinkClassName={"page-number"}
                    previousLinkClassName={"page-number"}
                    nextLinkClassName={"page-number"}
                    activeLinkClassName={"active"}
                    pageCount={Math.ceil(reviewsLength / reviewsPerPage)}
                    previousLabel={"Prev"}
                    nextLabel={"Next"}
                  />
                </div>
              ) : (
                <AddReview
                  id={id}
                  setLoading={setLoading}
                  clear={clear}
                  openConnectModal={openConnectModal}
                  address={address}
                  setError={setError}
                  setShowReviewForm={setShowReviewForm}
                />
              )}
              {/* Button to close the products modal */}
              <div className="bg-gray-200 px-4 py-3 text-right">
                <button
                  type="button"
                  className="py-2 px-4 bg-red-400 text-white rounded hover:bg-red-600 mr-2"
                  onClick={() => setVisible(false)}
                >
                  <i className="fas fa-times"></i> Close
                </button>
                {/* Button to show review form for the current product */}
                {reviewsLength > 0 ?                 <button
                  type="button"
                  onClick={() => setShowReviewForm(!showReviewFrom)}
                  disabled={!reviewActions.canReview && reviewActions.reviewed}
                  className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-700 mr-2 disabled:bg-green-200"
                >
                  {!showReviewFrom ? "Add Review" : "Show Reviews"}
                </button> : ""}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Reviews;
