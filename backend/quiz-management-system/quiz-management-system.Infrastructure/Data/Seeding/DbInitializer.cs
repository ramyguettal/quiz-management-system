using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.AcademicYearFolder;
using quiz_management_system.Domain.AcademicYearFolder.CoursesFolder;
using quiz_management_system.Domain.GroupFolder;
using quiz_management_system.Domain.Users.AdminFolder;
using quiz_management_system.Infrastructure.Idenitity;

namespace quiz_management_system.Infrastructure.Data.Seeding
{
    public class DbInitializer(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IServiceProvider serviceProvider,
        IAppDbContext appDbContext
    ) : IDbInitializer
    {




        private async Task SeedAcademicYearsAndCoursesAsync()
        {
            if (appDbContext.AcademicYears.Any())
                return;

            Guid NewId() => Guid.CreateVersion7();

            // -----------------------------
            // Create Academic Years
            // -----------------------------
            var y1 = AcademicYear.Create(NewId(), "Y1").TryGetValue();
            var y2 = AcademicYear.Create(NewId(), "Y2").TryGetValue();
            var y3 = AcademicYear.Create(NewId(), "Y3").TryGetValue();
            var y4 = AcademicYear.Create(NewId(), "Y4").TryGetValue();

            appDbContext.AcademicYears.AddRange(y1, y2, y3, y4);

            // -----------------------------
            // Add Groups using domain rule
            // -----------------------------
            void AddGroups(AcademicYear year)
            {
                for (int i = 1; i <= 12; i++)
                {
                    var group = Group.Create(NewId(), $"G{i}").TryGetValue();

                    var update = group.UpdateAcademicYear(year);
                    if (update.IsFailure)
                        throw new Exception(update.TryGetError().Description);

                    appDbContext.Groups.Add(group);
                }
            }

            AddGroups(y1);
            AddGroups(y2);
            AddGroups(y3);
            AddGroups(y4);

            // ----------------------------------------
            // COURSES PER YEAR WITH DESCRIPTIONS & CODES
            // ----------------------------------------

            // ---------------- Y1: Foundational Courses ----------------
            var y1Courses = new[]
            {
                // Semester 1
                ("Foundational Mathematics", "CS101", "Introduction to mathematical concepts including algebra, calculus, and discrete mathematics essential for computer science."),
                ("Data Structures and Algorithms 1", "CS102", "Fundamental data structures such as arrays, linked lists, stacks, queues, and basic algorithmic analysis."),
                ("Digital Systems", "CS103", "Digital logic design, Boolean algebra, combinational and sequential circuits, and computer organization fundamentals."),
                ("Information Technology Essentials", "CS104", "Overview of IT concepts including hardware, software, networks, and information systems management."),
                ("English 1", "ENG101", "Academic writing, reading comprehension, and communication skills for technical contexts."),
                ("Critical Thinking and Creativity Skills", "GEN101", "Development of analytical thinking, problem-solving approaches, and creative methodologies."),

                // Semester 2
                ("Object Oriented Programming", "CS105", "Core OOP principles including encapsulation, inheritance, polymorphism, and design patterns using modern languages."),
                ("Introduction to Linux", "CS106", "Linux operating system fundamentals, command line interface, shell scripting, and system administration basics."),
                ("Linear Algebra", "MATH101", "Vector spaces, matrices, linear transformations, eigenvalues, and applications in computer graphics and machine learning."),
                ("Mathematical Analysis 1", "MATH102", "Limits, continuity, derivatives, and integration with applications to computational problems."),
                ("Introduction to Statistics", "STAT101", "Descriptive statistics, probability distributions, hypothesis testing, and statistical inference fundamentals."),
                ("English 2", "ENG102", "Advanced academic writing, technical documentation, and professional communication skills.")
            };

            // ---------------- Y2: Core Computer Science ----------------
            var y2Courses = new[]
            {
                // Semester 3
                ("Data Structures and Algorithms 2", "CS201", "Advanced data structures including trees, graphs, heaps, hash tables, and algorithm design techniques."),
                ("Mathematical Logic", "CS202", "Propositional and predicate logic, proof techniques, set theory, and formal methods in computing."),
                ("Mathematical Analysis 2", "MATH201", "Sequences, series, multivariable calculus, and optimization methods with computational applications."),
                ("Databases", "CS203", "Relational database design, SQL, normalization, transactions, and database management system fundamentals."),
                ("Probability", "STAT201", "Probability theory, random variables, distributions, expectation, and stochastic processes."),
                ("Web Development", "CS204", "Frontend and backend web technologies, HTML, CSS, JavaScript, frameworks, and RESTful APIs."),
                ("Introduction to Business", "BUS201", "Business fundamentals, entrepreneurship, project management, and technology commercialization."),

                // Semester 4
                ("Theory of Computing", "CS205", "Automata theory, formal languages, computability, complexity theory, and computational models."),
                ("Operating Systems", "CS206", "Process management, memory management, file systems, concurrency, and OS design principles."),
                ("Computer Architecture", "CS207", "Processor design, instruction sets, pipelining, memory hierarchy, and parallel computing architectures."),
                ("Statistical Inference", "STAT202", "Parameter estimation, confidence intervals, hypothesis testing, and regression analysis."),
                ("Introduction to AI", "CS208", "Fundamentals of artificial intelligence including search algorithms, knowledge representation, and reasoning."),
                ("Mathematical Analysis 3", "MATH202", "Differential equations, Fourier analysis, and numerical methods for scientific computing."),
                ("Electronic Circuits Labs", "CS209", "Practical electronics including circuit analysis, microcontrollers, and hardware-software integration.")
            };

            // ---------------- Y3: Advanced Topics ----------------
            var y3Courses = new[]
            {
                // Semester 5
                ("Data Mining", "CS301", "Knowledge discovery, pattern recognition, clustering, classification, and association rule mining techniques."),
                ("Operations Research", "CS302", "Linear programming, optimization algorithms, decision analysis, and operations management."),
                ("Stochastic Modelling and Simulation", "CS303", "Monte Carlo methods, discrete event simulation, queuing theory, and stochastic system modeling."),
                ("Software Engineering", "CS304", "Software development lifecycle, design patterns, testing, version control, and agile methodologies."),
                ("Networks and Protocols", "CS305", "Network architectures, TCP/IP protocols, routing, network security, and distributed systems."),
                ("Mobile Development", "CS306", "Mobile application development for iOS and Android platforms, UI/UX design, and cross-platform frameworks."),
                ("Entrepreneurship and Innovation", "BUS301", "Startup creation, innovation management, business models, and technology venture development."),

                // Semester 6
                ("Machine Learning", "CS307", "Supervised and unsupervised learning, neural networks, model evaluation, and ML algorithm implementation."),
                ("Numerical Methods and Optimisation", "CS308", "Numerical analysis, optimization algorithms, gradient methods, and computational efficiency."),
                ("Time Series Analysis and Classification", "CS309", "Time series modeling, forecasting methods, trend analysis, and temporal pattern recognition."),
                ("Advanced Databases", "CS310", "NoSQL databases, distributed databases, data warehousing, big data technologies, and database optimization."),
                ("Computer and Network Security", "CS311", "Cryptography, network security protocols, threat analysis, secure system design, and ethical hacking."),
                ("Group-Project", "CS312", "Collaborative software development project applying engineering principles and teamwork skills."),
                ("Project Management", "BUS302", "Project planning, scheduling, risk management, resource allocation, and agile project management.")
            };

            // ---------------- Y4: Specialization & Capstone ----------------
            var y4Courses = new[]
            {
                // Semester 7
                ("Natural Language Processing", "CS401", "Text processing, language models, sentiment analysis, machine translation, and NLP applications."),
                ("Deep Learning", "CS402", "Deep neural networks, CNNs, RNNs, transformers, and advanced deep learning architectures."),
                ("Human Computer Interaction", "CS403", "User interface design, usability testing, interaction design principles, and user experience evaluation."),
                ("Wireless Communication Networks and Systems", "CS404", "Wireless technologies, mobile networks, 5G, IoT communication protocols, and network design."),
                ("Introduction to Mobile Robotics", "CS405", "Robot kinematics, sensors, actuators, path planning, localization, and autonomous navigation."),
                ("Internship Project", "CS406", "Professional work experience in industry applying computer science knowledge to real-world problems."),
                ("AI and Ethics", "CS407", "Ethical implications of AI, bias in algorithms, privacy, transparency, and responsible AI development."),
                ("Selected topics in AI-Technology", "CS408", "Current trends and emerging topics in artificial intelligence and advanced computing technologies."),

                // Semester 8
                ("Computer Vision", "CS409", "Image processing, object detection, recognition, segmentation, and visual understanding using deep learning."),
                ("Big Data Analytics and Visualization", "CS410", "Big data frameworks, distributed computing, data visualization techniques, and analytics at scale."),
                ("Reinforcement Learning", "CS411", "Markov decision processes, Q-learning, policy gradients, and applications in autonomous systems."),
                ("Speech Processing", "CS412", "Speech recognition, synthesis, audio signal processing, and voice-enabled application development."),
                ("High Performance Computing", "CS413", "Parallel algorithms, GPU computing, distributed systems, and performance optimization techniques."),
                ("Enterprise Computing", "CS414", "Enterprise architecture, cloud computing, microservices, DevOps, and scalable system design."),
                ("Academic Communication and Research", "CS415", "Research methodology, academic writing, literature review, and scientific communication skills.")
            };

            // -----------------------------
            // Add courses with descriptions and codes
            // -----------------------------
            void AddCourses(AcademicYear year, (string title, string code, string description)[] courses)
            {
                foreach (var (title, code, description) in courses)
                {
                    var courseResult = Course.Create(NewId(), title, description, code, year);
                    if (courseResult.IsFailure)
                        continue;

                    var course = courseResult.TryGetValue();
                    appDbContext.Courses.Add(course);
                }
            }

            AddCourses(y1, y1Courses);
            AddCourses(y2, y2Courses);
            AddCourses(y3, y3Courses);
            AddCourses(y4, y4Courses);

            await appDbContext.SaveChangesAsync(CancellationToken.None);
        }





        private async Task SeedRolesAndPermissionsAsync()
        {
            if (roleManager.Roles.Any()) return;


            IReadOnlyList<string> roleNames = DefaultRoles.GetAll();

            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {

                    await roleManager.CreateAsync(new ApplicationRole
                    {

                        Name = roleName,
                        ConcurrencyStamp = Guid.CreateVersion7().ToString(),


                    });
                }
            }
        }



        private async Task SeedSuperAdminAsync()
        {
            var config = serviceProvider.GetRequiredService<IConfiguration>();

            string SuperAdminEmail = config["SuperAdmin:Email"]!;
            string SuperAdminPass = config["SuperAdmin:Password"]!;


            var ownerUsers = await userManager.GetUsersInRoleAsync(DefaultRoles.SuperAdmin);
            if (ownerUsers.Any())
                return;

            var ownerIdentityResult = ApplicationUser.Create(SuperAdminEmail, DefaultUsers.SuperAdmin.FullName);
            if (ownerIdentityResult.IsFailure) throw new InvalidOperationException();
            var ownerIdentity = ownerIdentityResult.TryGetValue();
            ownerIdentity.EmailConfirmed = true;

            IdentityResult identityResult = await userManager.CreateAsync(ownerIdentity, SuperAdminPass);
            if (!identityResult.Succeeded)
                throw new Exception(string.Join(",", identityResult.Errors.Select(e => e.Description)));

            await userManager.AddToRoleAsync(ownerIdentity, DefaultRoles.SuperAdmin);


            var ownerDomain = Admin.Create(

                id: ownerIdentity.Id,
                fullName: DefaultUsers.SuperAdmin.FullName,
                email: SuperAdminEmail,
                fireEvent: false
            );


            Admin admin = ownerDomain.TryGetValue();

            appDbContext.Admins.Add(admin);
            await appDbContext.SaveChangesAsync(CancellationToken.None);
        }








        public async Task SeedAsync()
        {

            await SeedAcademicYearsAndCoursesAsync();


            await SeedRolesAndPermissionsAsync();
            await SeedSuperAdminAsync();


        }
    }
}