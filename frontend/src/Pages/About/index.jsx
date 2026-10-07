import {
  FaLeaf,
  FaFlask,
  FaGlobe,
  FaChartLine,
  FaAward,
  FaHeart,
  FaSeedling,
  FaShieldAlt,
  FaHandsHelping,
  FaEye,
  FaBookOpen,
  FaUniversity,
  FaEnvira,
  FaBug,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
  FaDatabase,
} from "react-icons/fa";
import Header from "../../Components/Layout/Header";
import HeaderImage from "../../assets/images/about-utb.webp";
import UtbLogo from "../../assets/images/utblogo.webp";

function About({ onGetStarted }) {
  const investigators = [
    {
      name: "Caleb Villalba Hernández",
      title: "Developer",
      department: "School of Digital Transformation",
      specialization:
        "Student of Systems and Computer Engineering - Universidad Tecnológica de Bolívar",
      image: "/caleb_villalba.jpeg",
      bio: ["Fullstack developer with JavaScript/TypeSctript, and Python."],
    },
    {
      name: "Victor Martinez Toscano",
      title: "Developer",
      department: "School of Digital Transformation",
      specialization:
        "Student of Systems and Computer Engineering - Universidad Tecnológica de Bolívar",
      image: "/Victor Martinez.jpeg",
      imagePosition: "object-top",
      bio: ["ML Developer"],
    },
    {
      name: "Felipe Jimenez Acuña",
      title: "Developer",
      department: "School of Digital Transformation",
      specialization:
        "Student of Systems and Computer Engineering - Universidad Tecnológica de Bolívar",
      image: "/Felipe Jimenez.jpeg",
      imagePosition: "object-center",
      bio: ["Research, Documentation and Content Creator"],
    },
    {
      name: "Lic. Andrea Menco Tovar",
      title: "Principal Investigator",
      department: "School of Digital Transformation",
      specialization: "Lic. in Mathematics and M. Sc. in Applied Statistics",
      image: "/Andrea Menco.jpeg",
      bio: [
        "Bachelor's degree in Mathematics and a Master's degree in Applied Statistics. Currently pursuing a PhD in Engineering, specializing in Electronics and Computing, at the same university. ",
        "She is also a recipient of the Ministry of Science and Technology's Call for Proposals 933 for National Doctoral Programs with a Territorial, Ethnic, and Gender Focus, within the framework of the Mission-Oriented Policy.",
        "Research interests include image processing, computer vision, data science, and applied statistics.",
      ],
    },
    {
      name: "Dr. Juan Carlos Martinez",
      title: "Research professor",
      department: "School of Digital Transformation",
      specialization: "Ph.D. in Computer Science",
      image: "/Juan Martinez.png",
      bio: [
        "Electronic Engineer, Master in Electric Power from Universidad Industrial de Santander.",
        "Ph.D. in Computer Science from Northeastern University, Boston. ",
        "Fulbright DNP Colciencias Scholar (2007).",
        "Researcher and professor at Universidad Tecnológica de Bolívar since 2004.",
      ],
    },
    {
      name: "Dr. Edwin Puertas",
      title: "Research professor",
      department: "School of Digital Transformation",
      specialization: "Artificial Intelligence Software Architect",
      image: "/Edwin Puertas.png",
      bio: [
        "Artificial Intelligence Software Architect and Natural Language Processing (NLP) Researcher, with 20 years of experience in both academic and professional settings. ",
        "Currently serves as Director of the Ph.D. and Master’s Programs in Engineering at Universidad Tecnológica de Bolívar and is an active member of the Artificial Intelligence Standards Committee.",
        "His work focuses on bridging the gap between academic research and practical industry applications, leading innovative projects in the field of Artificial Intelligence (AI).",
      ],
    },
    {
      name: "Dr. Jairo Serrano Castañeda",
      title: "Research professor",
      department: "School of Digital Transformation",
      specialization: "Ph.D. in Engineering",
      image: "/Jairo Serrano.png",
      bio: [
        "Systems Engineer graduated from the Universidad Tecnológica de Bolívar and Master’s in Free Software from the Universidad Autónoma de Bucaramanga.",
        "PhD in Engineering at Pontificia Universidad Javeriana, developing Social Simulations by applying Artificial Intelligence in Multi-Agent Systems on Distributed Servers.",
        "With over 23 years of professional experience, he serves as an Assistant Professor at the Universidad Tecnológica de Bolívar, where he has made significant contributions to academic training and research development.",
      ],
    },
  ];

  const objectives = [
    {
      icon: FaDatabase,
      title: "Creation of a comprehensive database",
      description:
        "Build the largest database of Colombian plant species with disease classification.",
      details:
        "More than 1000 native species with multiple documented pathological states.",
    },
    {
      icon: FaBug,
      title: "Disease Pattern Recognition",
      description:
        "Develop AI models to identify early signs of diseases in Colombian flora",
      details:
        "Focus on fungal, bacterial, viral, and nutrient deficiency symptoms",
    },
    {
      icon: FaShieldAlt,
      title: "Agricultural Protection",
      description:
        "Create tools to help farmers and researchers protect Colombian crops",
      details:
        "Early detection system to prevent crop losses and improve food security",
    },
    {
      icon: FaGlobe,
      title: "Biodiversity Conservation",
      description:
        "Support the efforts to conserve the unique biodiversity of Colombia's plants",
      details:
        "Document and preserve the knowledge of endemic species and their health patterns",
    },
  ];

  const impacts = [
    {
      category: "Agricultural impact",
      icon: FaSeedling,
      color: "green",
      items: [
        "Reduce crop losses by 30-40% through early disease detection",
        "Support over 50,000 Colombian farmers with diagnostic tools",
        "Improve food security for rural communities",
        "Enhance sustainable agricultural practices",
      ],
    },
    {
      category: "Scientific impact",
      icon: FaFlask,
      color: "blue",
      items: [
        "First comprehensive database of Colombian plant diseases",
        "Advance AI applications in tropical agriculture",
        "Support botanical research and taxonomy",
        "Enable predictive modeling of diseases",
      ],
    },
    {
      category: "Economic impact",
      icon: FaChartLine,
      color: "purple",
      items: [
        "Prevent crop losses of over $100 million annually",
        "Create new opportunities in agrotechnology",
        "Support rural economic development",
        "Reduce the costs of pesticide dependency",
      ],
    },
    {
      category: "Environmental impact",
      icon: FaEnvira,
      color: "emerald",
      items: [
        "Preserve the unique biodiversity of Colombia",
        "Reduce the use of chemical pesticides",
        "Support ecosystem health monitoring",
        "Enable climate change adaptation strategies",
      ],
    },
  ];

  const challenges = [
    {
      icon: FaExclamationTriangle,
      title: "Colombia's agricultural challenge",
      description:
        "Colombia loses around 40.5% of its total agricultural production, which includes losses caused by inadequate practices, technical failures, deficiencies in transportation and storage, as well as pests and diseases.",
    },
    {
      icon: FaEye,
      title: "Limited diagnostic tools",
      description:
        "Although there are specialized laboratories and phytosanitary diagnostic services in Colombia, many rural farmers face significant difficulties in accessing these resources due to economic, technological, and geographical barriers.",
    },
    {
      icon: FaGlobe,
      title: "Biodiversity at risk",
      description:
        "Colombia's unique flora faces threats from climate change and diseases, with limited documentation on disease patterns.",
    },
  ];

  return (
    <>
      {" "}
      <Header className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Hero Section */}
        <section className="relative  bg-gradient-to-r from-green-600 to-emerald-600">
          <img
            src={HeaderImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 z-10 pointer-events-none" />
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center text-white">
              <div className="flex justify-center mb-8 items-center gap-2 flex-col md:flex-row">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="p-6 bg-green-400 bg-opacity-20 rounded-full">
                      <FaLeaf className="h-16 w-16" />
                    </div>
                    <div className="absolute -top-2 -right-2 p-2 bg-yellow-400 rounded-full">
                      <FaBug className="h-6 w-6 text-yellow-800" />
                    </div>
                  </div>
                </div>
                <div className=" bg-blue-100 rounded-full size-fit max-w-[300px] px-10 py-4">
                  <img src={UtbLogo} alt="UTB Logo" className="" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Our <span className="text-yellow-300">Mission</span>
              </h1>

              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
                Protecting Colombia's agricultural heritage and biodiversity by
                identifying plant diseases with artificial intelligence
                technology and collecting data through crowdsourcing.
              </p>

              <div className="flex justify-center">
                <div className="bg-green-400 bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center space-x-8 flex-wrap">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        🇨🇴 57+ 3014590687
                      </div>
                      <div className="text-sm opacity-80">Contact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">1,000+</div>
                      <div className="text-sm opacity-80">Target Species</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">AI</div>
                      <div className="text-sm opacity-80">Technology</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Challenge Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                The challenge we face
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Colombia faces significant challenges in agriculture and
                biodiversity that require innovative solutions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {challenges.map((challenge, index) => (
                <div
                  key={index}
                  className="bg-red-50 border border-red-200 rounded-lg p-6"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <challenge.icon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-700 text-center">
                    {challenge.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Solution Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Solution
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A comprehensive approach that combines crowdsourcing, AI
                technology, and expert knowledge to build a database for
                classifying plant diseases in Colombia.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {objectives.map((objective, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <objective.icon className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                    {objective.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-3">
                    {objective.description}
                  </p>
                  <p className="text-sm text-green-600 text-center font-medium">
                    {objective.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* University Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <FaUniversity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Universidad Tecnológica de Bolívar
                    </h3>
                    <p className="text-gray-600">
                      Ternera campus • Faculty of Engineering
                    </p>
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Leading Agricultural Research in Colombia
                </h2>

                <p className="text-lg text-gray-600 mb-6">
                  As the leading public university in the Carribbean region of
                  Colombia, Universidad Tecnológica de Bolívar is aiming to
                  become a leading institution in agricultural research. Our
                  interdisciplinary approach combines traditional botanical
                  knowledge with cutting-edge AI technology.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <FaAward className="h-6 w-6 text-yellow-500 mr-3 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Excellence in Research
                      </h4>
                      <p className="text-gray-600">
                        Ranked among the top universities in Colombia computer
                        science and engineering research
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaBookOpen className="h-6 w-6 text-green-600 mr-3 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Herbarium Collection
                      </h4>
                      <p className="text-gray-600">
                        Aiming to build a herbarium collection of Colombian
                        plant species
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaHandsHelping className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Community Impact
                      </h4>
                      <p className="text-gray-600">
                        Keeping farmers and communities involved to expand
                        project growth
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Financing and Support Goals
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaCheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      COLCIENCIAS research grant
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Alliance with the Ministry of Agriculture
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      International Collaboration Network
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Partnerships with the private sector
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Project Timeline
                  </h4>
                  <div className=" flex flex-col md:grid md:grid-cols-2 text-sm text-gray-600 gap-2">
                    <p className="font-semibold">February 2025 - May 2025</p>
                    <p>Data Collection and Algorithm Development</p>
                    <p className="font-semibold">May 2025 - August 2025</p>
                    <p>System Design</p>
                    <p className="font-semibold">August 2025 - November 2025</p>
                    <p>Web Platform Development</p>
                    <p className="font-semibold">
                      November 2025 - December 2025
                    </p>
                    <p>Testing and Validation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Research Team Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Meet our research team
              </h2>
            </div>

            <div className="flex flex-wrap gap-8 justify-center">
              {investigators.map((investigator, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg overflow-hidden max-w-[250px]  md:max-w-[300px]"
                >
                  <img
                    src={investigator.image || "/placeholder.svg"}
                    alt={investigator.name}
                    className={`w-full h-80 object-cover rounded-t-lg ${
                      investigator.imagePosition || ""
                    }`}
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {investigator.name}
                    </h3>
                    <p className="text-green-600 font-medium mb-2">
                      {investigator.title}
                    </p>
                    <p className="text-sm text-blue-600 mb-3">
                      {investigator.department}
                    </p>
                    <p className="text-sm font-semibold mb-3">
                      {investigator.specialization}
                    </p>
                    <ul className="list-disc list-inside flex flex-col gap-2">
                      {investigator.bio.map((item) => (
                        <li className="text-sm text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Expected Impact
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                This project will generate a positive and lasting change in
                multiple sectors of the agricultural sector in Colombia and the
                rest of the world.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {impacts.map((impact, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-8">
                  <div className="flex items-center mb-6">
                    <div
                      className={`p-3 bg-${impact.color}-100 rounded-full mr-4`}
                    >
                      <impact.icon
                        className={`h-8 w-8 text-${impact.color}-600`}
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {impact.category}
                    </h3>
                  </div>

                  <ul className="space-y-3">
                    {impact.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <FaCheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join our mission
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Help us build the future of Colombian agriculture and biodiversity
              conservation. Every contribution makes a difference.
            </p>

            <button
              onClick={onGetStarted}
              className="bg-white text-green-600 hover:bg-gray-100 font-bold py-4 px-12 rounded-lg text-xl transition-colors inline-flex items-center"
            >
              <FaHeart className="mr-3" />
              Start Contributing
              <FaArrowRight className="ml-3" />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

export default About;
