import React from 'react'
import { FiShoppingCart } from "react-icons/fi"
import { useParams } from "react-router-dom"

import { getImgUrl } from '../../utils/getImgUrl';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { useFetchBookByIdQuery } from '../../redux/features/books/booksApi';

const SingleBook = () => {
    const { id } = useParams();
    const { data: book, isLoading, isError } = useFetchBookByIdQuery(id);

    const dispatch = useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading book info</div>;

    return (
        <div className="max-w-lg shadow-md p-5">
            <h1 className="text-2xl font-bold mb-6">{book.title}</h1>

            <div className="">
                <div>
                    <img
                        src={`${getImgUrl(book.coverImage)}`}
                        alt={book.title}
                        className="mb-8"
                    />
                </div>

                <div className="mb-5">
                    {/* <p className="text-gray-700 mb-2"><strong>Author:</strong> {book.author || 'admin'}</p> */}
                    <p className="text-gray-700 mb-4">
                        <strong>Published:</strong> {new Date(book?.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 mb-4 capitalize">
                        <strong>Category:</strong> {book?.category}
                    </p>
                    <p className="text-gray-700 mb-4">
                        <strong>Description:</strong> {book.description}
                    </p>

                    {/* Price Section */}
                    <div className="mb-6">
                        <p className="font-medium text-xl mb-2">₹{book?.newPrice}</p>
                        {book?.oldPrice && (
                            <p className="line-through text-gray-500 text-sm">
                                ₹{book?.oldPrice}
                            </p>
                        )}
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={() => handleAddToCart(book)}
                    className="btn-primary px-6 py-2 flex items-center justify-center gap-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
                >
                    <FiShoppingCart />
                    <span>Add to Cart</span>
                </button>
            </div>
        </div>
    );
};

export default SingleBook;