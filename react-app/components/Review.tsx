import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { identiconTemplate } from "@/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useContractCall } from "@/hooks/contract/useContractRead";
import { useContractSend } from "@/hooks/contract/useContractWrite";

import useCreateInteraction from "@/hooks/contract/useCreateInteraction";

import { Dispatch, SetStateAction } from "react";

interface ReviewStruct {
  address: `0x${string}`;
  date: Date;
  rating: number;
  review: string;
  helpful: number;
  ratedHelpful: boolean;
}

interface ReviewProps {
  productId: number;
  reviewId: number;
  openConnectModal: (() => void) | undefined;
  setLoading: Dispatch<SetStateAction<string>>;
  clear: () => void;
  address: `0x${string}`;
  setError: Dispatch<SetStateAction<string>>;
}
function Review({
  productId,
  reviewId,
  openConnectModal,
  setLoading,
  clear,
  address,
  setError,
}: ReviewProps) {
  const { data: rawReview }: any = useContractCall(
    "getReview",
    [productId, reviewId],
    true,
    address
  );
  const [review, setReview] = useState<ReviewStruct | null>(null);
  // formats the rawReview data fetched and assigns it to the review variable
  const getFormatReview = useCallback(() => {
    if (!rawReview) return null;
    setReview({
      address: rawReview[0],
      date: new Date(Number(rawReview[1]) * 1000),
      rating: Number(rawReview[2]),
      review: rawReview[3],
      helpful: Number(rawReview[4]),
      ratedHelpful: rawReview[5],
    });
  }, [rawReview]);

  // Displays five stars that portrays the rating of the review
  const renderStars = () => {
    if (!review) return null;
    const _stars = [];
    for (let i = 0; i < 5; i++) {
      // gives the yellow color to an x number of stars based off the rating of the review
      // otherwise, remaining stars(if any) will be colored gray
      let classNames =
        "w-5 h-5" +
        " " +
        (review.rating > i ? "text-yellow-400" : "text-gray-500");
      _stars.push(
        <FontAwesomeIcon
          key={`reviewStars-${productId}-${reviewId}-${i}`}
          icon={faStar}
          className={classNames}
        />
      );
    }

    return _stars;
  };

  const { writeAsync: rateHelpfulAction } = useContractSend("rateHelpful", [
    productId,
    reviewId,
  ]);

  // function that is called to rate a review as helpful
  const rateHelpful = useCreateInteraction(
    rateHelpfulAction,
    setLoading,
    openConnectModal,
    address,
    clear,
    setError,
    {
      pending: "Rating Review...",
      success: "Rated successfully",
      error: "Failed to rate review",
    },
    "Rating review..."
  );


    // onClick event handler to rate a review as helpful
    const onClickRateHelfpul = async() => {
      try {
        await rateHelpful();
      } catch (error) {
        console.error(error)
      }
    }
  // Call the getFormatReview function when the rawReview state changes
  useEffect(() => {
    getFormatReview();
  }, [getFormatReview]);

  if (!review) return null;
  return (
    <div className="py-3 mb-3">
      {/* Show the address of the Reviewer as an identicon and link to the address on the Celo Explorer */}
      <div className="flex align-center">
        <Link
          href={`https://explorer.celo.org/alfajores/address/${review.address}`}
          className={"rounded-full"}
        >
          {identiconTemplate(review.address)}
        </Link>
        <span className="ml-4 font-semibold">{review.date.toDateString()}</span>
        <div className="flex items-center ml-5 -mt-8">{renderStars()}</div>
      </div>

      <p className="mx-0 mt-4">{review.review}</p>
      <button
        className={`${
          review.ratedHelpful ? "disabled:bg-gray-100" : ""
        } text-base py-2 px-4 mt-5 bg-gray-200 hover:bg-gray-300`}
        disabled={review.ratedHelpful}
        onClick={onClickRateHelfpul}
      >
        Helpful
      </button>
      {review.helpful > 0 && (
        <span className="text-gray-500 ml-3">
          {review.helpful} people found this helpful
        </span>
      )}
    </div>
  );
}

export default Review;
