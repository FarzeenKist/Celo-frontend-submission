import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useContractSend } from "@/hooks/contract/useContractWrite";
import { updateStarsColor } from "@/helpers";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useCreateInteraction from "@/hooks/contract/useCreateInteraction";

import { Dispatch, SetStateAction } from "react";

interface AddReviewProps {
  id: number;
  openConnectModal: (() => void) | undefined;
  setLoading: Dispatch<SetStateAction<string>>;
  clear: () => void;
  address: string;
  setError: Dispatch<SetStateAction<string>>;
  setShowReviewForm: Dispatch<SetStateAction<boolean>>;
}

export default function AddReview({
  id,
  setLoading,
  clear,
  openConnectModal,
  address,
  setError,
  setShowReviewForm,
}: AddReviewProps) {
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");

  // Clear the input fields after the review is added to the marketplace
  const clearForm = () => {
    setReviewComment("");
    setReviewRating(0);
  };

  const [debouncedReviewComment] = useDebounce(reviewComment, 500);
  const [debouncedReviewRating] = useDebounce(reviewRating, 500);

  const { writeAsync: reviewProd } = useContractSend("reviewProduct", [
    Number(id),
    debouncedReviewRating,
    debouncedReviewComment,
  ]);

  const reviewProduct = useCreateInteraction(
    reviewProd,
    setLoading,
    openConnectModal,
    address,
    clear,
    setError,
    {
      pending: "Reviewing product...",
      success: "Reviewed successfully",
      error: "Failed to review product",
    },
    "Reviewing..."
  );

  const renderStars = () => {
    const _stars = [];
    for (let i = 0; i < 5; i++) {
      let classNames = "stars-input w-5 h-5 text-gray-400";
      _stars.push(
        <FontAwesomeIcon
          icon={faStar}
          className={classNames}
          size="lg"
          onClick={() => {
            setReviewRating(i + 1);
            updateStarsColor(i + 1);
          }}
          cursor="pointer"
        />
      );
    }

    return _stars;
  };
  return (
    <form>
      <h3 className="font-bold text-2xl mb-5 text-center">Add Review</h3>

      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <label>Review</label>
        <textarea
          required
          rows={10}
          className="w-full bg-gray-100 p-2 mt-2 mb-3"
          placeholder="Your review..."
          value={reviewComment}
          onChange={(e) => {
            setReviewComment(e.target.value);
          }}
        ></textarea>
        <div className="text-center">
          <label className="block py-3">Rate the product</label>
          {renderStars()}
        </div>
      </div>
      <div className="py-2 ml-2 text-center">
        <button
          type="button"
          className="py-2 px-3 bg-cyan-400 text-white rounded hover:bg-cyan-700 mr-2"
          onClick={async () => {
            await reviewProduct();
            clearForm();
            setShowReviewForm(false);
          }}
        >
          <i className="fas fa-times"></i> Add Review
        </button>
      </div>
    </form>
  );
}
