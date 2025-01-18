const Page = () => (
  <div className="border-2 flex w-full h-[80vh] bg-blue-100 rounded-lg">
    {/* All friends will be left */}
    <div className="w-[400px] flex flex-col h-[100vh] bg-blue-200 overflow-hidden">
      <div className="pl-6 flex pt-2 h-[50px]">
        <h3 className="font-bold">Your Friends</h3>
      </div>
      {/* List All Friends */}
      <ul className="flex flex-col gap-4 mt-4 px-6">
        <li className="cursor-pointer p-2 rounded-lg transition-all duration-150 ease-out hover:bg-blue-300 hover:shadow-md">
          Arush Sharma
        </li>
        <li className="cursor-pointer p-2 rounded-lg transition-all duration-150 ease-out hover:bg-blue-300 hover:shadow-md">
          Abhay Sharma
        </li>
      </ul>
    </div>
    {/* Chat Box */}
    <div className="flex flex-col h-[100vh] w-full bg-blue-200">
      <div
        className="pl-6 flex pt-2 
      h-[50px] items-center justify-between"
      >
        <div className="font-bold">Arush Sharma</div>
        <div className="flex items-center ">
          <div className="flex items-center mr-4">Video Icon</div>
          <div className="flex items-center">Dial</div>
        </div>
        rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr{" "}
      </div>
      <div className="pl-6 flex pt-2 h-[50px] items-center border-b-2 border-gray-300"></div>
    </div>
  </div>
);

export default Page;
