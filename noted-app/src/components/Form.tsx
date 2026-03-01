import React from 'react'

const Form = () => {
    return (
        <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-[#1f1f1f] w-[400px] p-8 rounded-xl shadow-lg flex flex-col gap-6">

            <h2 className="text-white text-2xl font-semibold text-center">
              Add Note
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Title</label>
              <input
                type="text"
                placeholder="Enter note title"
                className="bg-[#2a2a2a] text-white px-3 py-2 rounded-md outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Description</label>
              <textarea
                rows={4}
                placeholder="Enter note description"
                className="bg-[#2a2a2a] text-white px-3 py-2 rounded-md outline-none resize-none"
              />
            </div>

            <button className="bg-[#312EB5] hover:bg-[#2623a0] text-white py-2 rounded-md font-semibold transition duration-300">
              Add Note
            </button>

            {/* Close Button */}
            <button
              onClick={() => setForm(false)}
              className="text-gray-400 text-sm hover:text-white"
            >
              Cancel
            </button>

          </div>
        </div>
    )
}

export default Form
