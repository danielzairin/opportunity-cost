"use client";

export function Demo() {
  return (
    <section id="demo" className="bg-gray-50 py-20">
      <div className="w-[90%] max-w-[1200px] mx-auto px-5">
        <h2 className="text-3xl font-bold text-center mb-10">
          See It in Action
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-md demo-video">
            <div className="bg-gray-100 h-[300px] flex justify-center items-center text-center rounded-lg">
              <div className="p-5">
                <div className="mb-4 flex justify-center">
                  {/* SVG icon inline or Lucide PlayCircle icon can go here */}
                </div>
                <p className="text-lg text-gray-500 mb-0">
                  Demo Video Coming Soon
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">
              Transform Your Online Shopping
            </h3>
            <p className="mb-4 text-gray-600">
              With Opportunity Cost, you&apos;ll see the Bitcoin value of every
              purchase, helping you make more informed decisions based on the
              true opportunity cost of your spending.
            </p>
            <p className="mb-6 text-gray-600">
              Works seamlessly on shopping sites, real estate listings,
              financial platforms, and more!
            </p>
            <a
              href="#download"
              className="inline-block px-6 py-3 font-semibold rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-100 transition"
            >
              Get Started Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
