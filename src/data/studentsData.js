export const studentsData = {
  "student_1": {
    "student_id": "student_1",
    "name": {
      "en": {
        "first_name": "John",
        "last_name": "Doe",
        "display_name": "John Doe"
      },
      "ja": {
        "first_name": "ジョン",
        "last_name": "ドウ",
        "display_name": "ジョン・ドウ"
      }
    },
    "about": {
      "en": "A third-year student in the Product Design program, focusing on sustainable materials and user-centered design. Their work explores the intersection of traditional craftsmanship and modern technology.",
      "ja": "プロダクトデザイン専攻の3年生。持続可能な素材とユーザー中心のデザインに焦点を当てています。伝統的な職人技と現代技術の交差点を探求しています。"
    },
    "projects": [
      {
        "project_id": "project_1",
        "title": {
          "en": "Sustainable Furniture Collection",
          "ja": "サステナブル家具コレクション"
        },
        "description": {
          "en": "A collection of furniture pieces made from recycled materials, exploring sustainable design practices.",
          "ja": "リサイクル素材を使用した家具のコレクション。サステナブルデザインの実践を探求しています。"
        },
        "project_photos": [
          {
            "photo_id": "photo_1",
            "file_path": "/images/projects/project_1_photo_1.jpg",
            "caption": {
              "en": "Main piece from the collection",
              "ja": "コレクションのメインピース"
            }
          }
        ]
      }
    ],
    "artifacts": [
      {
        "artifact_id": "artifact_1",
        "title": {
          "en": "Recycled Wood Chair",
          "ja": "リサイクルウッドチェア"
        },
        "description": {
          "en": "A chair made from reclaimed wood, showcasing sustainable design principles.",
          "ja": "再生木材を使用した椅子。サステナブルデザインの原則を示しています。"
        },
        "file_paths": ["/images/artifacts/artifact_1.jpg"],
        "type": "physical",
        "tags": {
          "materials": {
            "en": ["recycled_wood", "metal"],
            "ja": ["再生木材", "金属"]
          },
          "themes": {
            "en": ["sustainability", "furniture"],
            "ja": ["サステナビリティ", "家具"]
          }
        }
      }
    ]
  },
  students: [
    {
      student_id: "student_001",
      name: {
        first_name: "Winifred",
        last_name: "Ahupa",
        display_name: "Winifred Ahupa"
      },
      email: "winifred.ahupa@example.edu",
      student_number: "STU123001",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_001",
          title: "Circular Communities",
          description: "Investigating circular economy principles within local communities, exploring how design can facilitate resource sharing, waste reduction, and sustainable living practices at the neighborhood level.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          submission_date: "2024-12-15T23:59:00Z",
          grade: "A-",
          status: "completed",
          project_photos: [
            {
              id: "photo_001",
              url: "/images/circular-communities-1.jpg",
              caption: "Community workshop exploring circular economy principles",
              width: 1200,
              height: 800
            },
            {
              id: "photo_002",
              url: "/images/circular-communities-2.jpg",
              caption: "Prototype of resource sharing platform",
              width: 1200,
              height: 800
            }
          ],
          artifacts: [
            {
              artifact_id: "artifact_001",
              title: "Community Resource Map",
              description: "Interactive mapping system showing local resource sharing networks",
              type: "digital_prototype",
              file_paths: ["/images/resource-map-1.jpg", "/images/resource-map-2.jpg"],
              creation_date: "2024-11-20T14:30:00Z",
              w: 220,
              h: 160,
              tags: {
                materials: ["digital", "mapping", "web"],
                themes: ["circular_economy", "community", "sustainability"],
                techniques: ["data_visualization", "user_research"],
                categories: ["digital_design", "social_innovation"]
              }
            },
            {
              artifact_id: "artifact_002",
              title: "Waste Flow Analysis",
              description: "Visual documentation of community waste streams and circular opportunities",
              type: "documentation",
              file_paths: ["/images/waste-flow-1.jpg"],
              creation_date: "2024-11-10T10:00:00Z",
              w: 180,
              h: 140,
              tags: {
                materials: ["paper", "infographics"],
                themes: ["waste_reduction", "systems_thinking"],
                techniques: ["systems_mapping", "data_analysis"],
                categories: ["research", "sustainability"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_002",
      name: {
        first_name: "Valentina",
        last_name: "Burbano",
        display_name: "Valentina Burbano"
      },
      email: "valentina.burbano@example.edu",
      student_number: "STU123002",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_002",
          title: "Materials of Soft Activisms",
          description: "Exploring the intersection of material culture and social activism through design research. This project investigates how everyday materials can become vehicles for political expression and community building.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          artifacts: [
            {
              artifact_id: "artifact_003",
              title: "Civic Glossary Interface",
              description: "Interactive digital interface for civic engagement and democratic participation",
              type: "digital_prototype",
              file_paths: ["/images/civic-glossary-1.jpg", "/images/civic-glossary-2.jpg"],
              creation_date: "2024-11-20T14:30:00Z",
              w: 200,
              h: 150,
              tags: {
                materials: ["digital", "interface"],
                themes: ["civic", "engagement", "democracy"],
                techniques: ["ui_design", "prototyping"],
                categories: ["digital_design", "civic_tech"]
              }
            },
            {
              artifact_id: "artifact_004",
              title: "Textile Activism Samples",
              description: "Collection of textile pieces exploring political messaging through fabric",
              type: "physical_prototype",
              file_paths: ["/images/textile-1.jpg", "/images/textile-2.jpg"],
              creation_date: "2024-11-05T16:00:00Z",
              w: 160,
              h: 190,
              tags: {
                materials: ["fabric", "thread", "dye"],
                themes: ["activism", "politics", "expression"],
                techniques: ["weaving", "embroidery", "dyeing"],
                categories: ["textile_design", "social_practice"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_003",
      name: {
        first_name: "Teppei",
        last_name: "Fuma",
        display_name: "Teppei Fuma"
      },
      email: "teppei.fuma@example.edu",
      student_number: "STU123003",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_003",
          title: "Digital Craftsmanship",
          description: "Bridging traditional Japanese craftsmanship with digital fabrication technologies, exploring how cultural heritage can be preserved and evolved through contemporary design methods.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          artifacts: [
            {
              artifact_id: "artifact_005",
              title: "Digital Joinery System",
              description: "3D printed joinery system based on traditional Japanese woodworking",
              type: "physical_prototype",
              file_paths: ["/images/joinery-1.jpg", "/images/joinery-2.jpg"],
              creation_date: "2024-11-25T12:00:00Z",
              w: 140,
              h: 170,
              tags: {
                materials: ["3d_printed_plastic", "wood"],
                themes: ["tradition", "innovation", "craftsmanship"],
                techniques: ["3d_printing", "woodworking", "parametric_design"],
                categories: ["product_design", "cultural_heritage"]
              }
            },
            {
              artifact_id: "artifact_006",
              title: "Process Documentation",
              description: "Video documentation of traditional vs digital making processes",
              type: "documentation",
              file_paths: ["/images/process-doc-1.jpg"],
              creation_date: "2024-11-15T14:00:00Z",
              w: 200,
              h: 120,
              tags: {
                materials: ["video", "photography"],
                themes: ["process", "comparison", "learning"],
                techniques: ["videography", "documentation"],
                categories: ["documentation", "research"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_004",
      name: {
        first_name: "Shione",
        last_name: "Akazawa",
        display_name: "Shione Akazawa"
      },
      email: "shione.akazawa@example.edu",
      student_number: "STU123004",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_004",
          title: "Sensory Memory Spaces",
          description: "Designing immersive environments that trigger memory through multisensory experiences, investigating the relationship between space, sensation, and recollection.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          artifacts: [
            {
              artifact_id: "artifact_007",
              title: "Scent Memory Installation",
              description: "Interactive installation exploring olfactory triggers for memory recall",
              type: "physical_prototype",
              file_paths: ["/images/scent-install-1.jpg", "/images/scent-install-2.jpg"],
              creation_date: "2024-11-18T15:30:00Z",
              w: 190,
              h: 140,
              tags: {
                materials: ["glass", "electronics", "essential_oils"],
                themes: ["memory", "sensation", "experience"],
                techniques: ["installation", "electronics", "aromatherapy"],
                categories: ["installation_design", "sensory_design"]
              }
            },
            {
              artifact_id: "artifact_008",
              title: "User Experience Map",
              description: "Mapping emotional and sensory responses to different environmental stimuli",
              type: "documentation",
              file_paths: ["/images/experience-map-1.jpg"],
              creation_date: "2024-11-12T10:45:00Z",
              w: 170,
              h: 130,
              tags: {
                materials: ["paper", "digital"],
                themes: ["emotion", "mapping", "user_experience"],
                techniques: ["user_research", "data_visualization"],
                categories: ["research", "ux_design"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_005",
      name: {
        first_name: "Risa",
        last_name: "Miyamoto",
        display_name: "Risa Miyamoto"
      },
      email: "risa.miyamoto@example.edu",
      student_number: "STU123005",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_005",
          title: "Urban Food Networks",
          description: "Investigating food distribution systems in urban environments, designing interventions that promote local food security and community resilience.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          artifacts: [
            {
              artifact_id: "artifact_009",
              title: "Community Garden App",
              description: "Mobile application connecting urban gardeners and food sharing networks",
              type: "digital_prototype",
              file_paths: ["/images/garden-app-1.jpg", "/images/garden-app-2.jpg"],
              creation_date: "2024-11-22T13:15:00Z",
              w: 120,
              h: 200,
              tags: {
                materials: ["mobile", "app", "interface"],
                themes: ["food_security", "community", "urban_agriculture"],
                techniques: ["app_design", "user_research"],
                categories: ["mobile_design", "social_innovation"]
              }
            },
            {
              artifact_id: "artifact_010",
              title: "Food Network Diagram",
              description: "Systems diagram mapping local food distribution networks",
              type: "documentation",
              file_paths: ["/images/food-network-1.jpg"],
              creation_date: "2024-11-08T16:20:00Z",
              w: 210,
              h: 150,
              tags: {
                materials: ["paper", "infographic"],
                themes: ["systems", "food", "distribution"],
                techniques: ["systems_mapping", "information_design"],
                categories: ["research", "systems_design"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_006",
      name: {
        first_name: "Queenie",
        last_name: "Yan",
        display_name: "Queenie Yan"
      },
      email: "queenie.yan@example.edu",
      student_number: "STU123006",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_006",
          title: "Intergenerational Communication",
          description: "Designing tools and spaces that facilitate meaningful communication between different generations, addressing digital divides and cultural gaps.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          artifacts: [
            {
              artifact_id: "artifact_011",
              title: "Bridge Interface",
              description: "Digital platform designed for cross-generational storytelling",
              type: "digital_prototype",
              file_paths: ["/images/bridge-interface-1.jpg", "/images/bridge-interface-2.jpg"],
              creation_date: "2024-11-19T11:30:00Z",
              w: 190,
              h: 140,
              tags: {
                materials: ["web", "interface", "digital"],
                themes: ["intergenerational", "storytelling", "connection"],
                techniques: ["web_design", "user_testing"],
                categories: ["web_design", "social_design"]
              }
            },
            {
              artifact_id: "artifact_012",
              title: "Communication Toolkit",
              description: "Physical toolkit for facilitating family conversations",
              type: "physical_prototype",
              file_paths: ["/images/toolkit-1.jpg"],
              creation_date: "2024-11-14T09:45:00Z",
              w: 160,
              h: 180,
              tags: {
                materials: ["cardboard", "paper", "fabric"],
                themes: ["conversation", "family", "tools"],
                techniques: ["prototyping", "user_testing"],
                categories: ["product_design", "social_tools"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_007",
      name: {
        first_name: "Misato",
        last_name: "Shimizu",
        display_name: "Misato Shimizu"
      },
      email: "misato.shimizu@example.edu",
      student_number: "STU123007",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_007",
          title: "Therapeutic Material Interactions",
          description: "Exploring how material properties and textures can be designed to provide therapeutic benefits, particularly for stress relief and emotional wellbeing.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          artifacts: [
            {
              artifact_id: "artifact_013",
              title: "Tactile Stress Relief Kit",
              description: "Collection of textured objects designed for stress relief through touch",
              type: "physical_prototype",
              file_paths: ["/images/tactile-kit-1.jpg", "/images/tactile-kit-2.jpg"],
              creation_date: "2024-11-21T14:15:00Z",
              w: 150,
              h: 160,
              tags: {
                materials: ["silicone", "fabric", "wood"],
                themes: ["therapy", "stress_relief", "wellbeing"],
                techniques: ["material_experimentation", "user_testing"],
                categories: ["therapeutic_design", "material_design"]
              }
            },
            {
              artifact_id: "artifact_014",
              title: "Material Response Study",
              description: "Research documentation on user responses to different textures",
              type: "documentation",
              file_paths: ["/images/material-study-1.jpg"],
              creation_date: "2024-11-10T13:20:00Z",
              w: 200,
              h: 140,
              tags: {
                materials: ["paper", "data_visualization"],
                themes: ["research", "user_response", "materials"],
                techniques: ["user_research", "data_analysis"],
                categories: ["research", "psychology"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_008",
      name: {
        first_name: "Luming",
        last_name: "Zhao",
        display_name: "Luming Zhao"
      },
      email: "luming.zhao@example.edu",
      student_number: "STU123008",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_008",
          title: "AI-Human Collaboration Tools",
          description: "Designing interfaces and workflows that enhance collaboration between artificial intelligence systems and human creativity, exploring new paradigms of human-AI partnership.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          artifacts: [
            {
              artifact_id: "artifact_015",
              title: "Collaborative AI Interface",
              description: "Prototype interface for creative collaboration between humans and AI",
              type: "digital_prototype",
              file_paths: ["/images/ai-interface-1.jpg", "/images/ai-interface-2.jpg"],
              creation_date: "2024-11-24T16:45:00Z",
              w: 220,
              h: 140,
              tags: {
                materials: ["digital", "ai", "interface"],
                themes: ["collaboration", "artificial_intelligence", "creativity"],
                techniques: ["interface_design", "ai_integration"],
                categories: ["ai_design", "interaction_design"]
              }
            },
            {
              artifact_id: "artifact_016",
              title: "Workflow Analysis",
              description: "Study of human-AI collaboration patterns in creative work",
              type: "documentation",
              file_paths: ["/images/workflow-1.jpg"],
              creation_date: "2024-11-16T12:30:00Z",
              w: 180,
              h: 130,
              tags: {
                materials: ["digital", "analysis"],
                themes: ["workflow", "collaboration", "efficiency"],
                techniques: ["process_analysis", "user_research"],
                categories: ["research", "workflow_design"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_009",
      name: {
        first_name: "Kaining",
        last_name: "He",
        display_name: "Kaining He"
      },
      email: "kaining.he@example.edu",
      student_number: "STU123009",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_009",
          title: "Sustainable Manufacturing Processes",
          description: "Investigating and prototyping sustainable manufacturing processes that minimize waste and environmental impact while maintaining product quality and design integrity.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          artifacts: [
            {
              artifact_id: "artifact_017",
              title: "Zero-Waste Production Line",
              description: "Model demonstrating circular manufacturing process",
              type: "physical_prototype",
              file_paths: ["/images/production-line-1.jpg", "/images/production-line-2.jpg"],
              creation_date: "2024-11-20T10:15:00Z",
              w: 240,
              h: 160,
              tags: {
                materials: ["recycled_plastic", "aluminum", "cardboard"],
                themes: ["sustainability", "manufacturing", "circular_economy"],
                techniques: ["prototyping", "systems_design"],
                categories: ["industrial_design", "sustainability"]
              }
            },
            {
              artifact_id: "artifact_018",
              title: "Environmental Impact Analysis",
              description: "Comparative analysis of traditional vs sustainable manufacturing",
              type: "documentation",
              file_paths: ["/images/impact-analysis-1.jpg"],
              creation_date: "2024-11-12T15:00:00Z",
              w: 190,
              h: 140,
              tags: {
                materials: ["paper", "charts", "data"],
                themes: ["environment", "analysis", "comparison"],
                techniques: ["data_analysis", "environmental_assessment"],
                categories: ["research", "environmental_design"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_010",
      name: {
        first_name: "Josh",
        last_name: "Green",
        display_name: "Josh Green"
      },
      email: "josh.green@example.edu",
      student_number: "STU123010",
      enrollment_year: 2023,
      program: "Design Research",
      about: "Josh is an interdisciplinary designer based in Glasgow who explores the critical intersection between technology and civic agency. His practice examines how digital tools and systems can either empower or marginalize communities, with a particular focus on creating more technologically equitable futures. Through research, design, and community engagement, Josh investigates power structures embedded within technological systems and works to develop inclusive alternatives. His interdisciplinary approach draws from design thinking, social theory, and civic innovation to address questions of accessibility, democratic participation, and digital justice. By centering community voices and needs, Josh's work advocates for technological solutions that strengthen rather than undermine civic agency and social equity.",
      year_level: 3,
      projects: [
        {
          project_id: "project_01",
          title: "London AI Voices Archive",
          description: "Creating an interactive digital archive that captures and presents diverse perspectives on artificial intelligence from London's communities, exploring how AI impacts different cultural and social groups.",
          course_code: "Unit 6",
          semester: "2025",
          project_photos: [
            {
              id: "photo_001",
              url: "/StudentPhotos/GreenJosh/GJ-1.png",
              caption: "Community workshop exploring circular economy principles",
              width: 1200,
              height: 800
            },
            {
              id: "photo_002",
              url: "/StudentPhotos/GreenJosh/GJ-2.png",
              caption: "Prototype of resource sharing platform",
              width: 1200,
              height: 800
            }
          ],
          artifacts: [
            {
              artifact_id: "artifact_019",
              title: "Interactive Voice Archive",
              description: "Web-based archive interface for browsing AI community voices",
              type: "digital_prototype",
              file_paths: ["/StudentPhotos/GreenJosh/GJ-4.png"],
              creation_date: "2024-11-25T17:30:00Z",
              w: 200,
              h: 150,
              tags: {
                materials: ["web", "audio", "database"],
                themes: ["artificial_intelligence", "community", "voices"],
                techniques: ["web_development", "audio_design", "database_design"],
                categories: ["web_design", "archive_design"]
              }
            },
            
            {
              artifact_id: "artifact_020",
              title: "Participatory AI Framework Book",
              description: "Photo and video documentation of community interview sessions",
              type: "documentation",
              file_paths: ["/StudentPhotos/GreenJosh/GJ-5.png"],
              creation_date: "2024-11-18T14:45:00Z",
              w: 170,
              h: 130,
              tags: {
                materials: ["photography", "video", "interviews"],
                themes: ["community", "engagement", "documentation"],
                techniques: ["photography", "interviewing", "ethnography"],
                categories: ["documentation", "social_research"]
              }
            }
          ]
        },
        {
          project_id: "project_02",
          title: "Junction Worms",
          description: "A playbook designed in collaboration with Lougborugh Junction Action Group to support workshops through play",
          course_code: "Unit 3",
          semester: "2024",
          project_photos: [
            {
              id: "photo_001",
              url: "/StudentPhotos/GreenJosh/GJ-6.png",
              caption: "Community workshop exploring circular economy principles",
              width: 1200,
              height: 800
            },
            {
              id: "photo_002",
              url: "/StudentPhotos/GreenJosh/GJ-7.png",
              caption: "Prototype of resource sharing platform",
              width: 1200,
              height: 800
            }
          ],
          artifacts: [
            {
              artifact_id: "artifact_019",
              title: "Playbook for Composting",
              description: "Web-based archive interface for browsing AI community voices",
              type: "digital_prototype",
              file_paths: ["/StudentPhotos/GreenJosh/GJ-8.png"],
              creation_date: "2024-11-25T17:30:00Z",
              w: 200,
              h: 150,
              tags: {
                materials: ["web", "audio", "database"],
                themes: ["artificial_intelligence", "community", "voices"],
                techniques: ["web_development", "audio_design", "database_design"],
                categories: ["web_design", "archive_design"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_011",
      name: {
        first_name: "Jasmine",
        last_name: "Shah",
        display_name: "Jasmine Shah"
      },
      email: "jasmine.shah@example.edu",
      student_number: "STU123011",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_011",
          title: "Cultural Heritage Preservation",
          description: "Developing digital tools and methodologies for preserving and sharing cultural heritage practices, with focus on traditional crafts and oral histories from diverse communities.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          artifacts: [
            {
              artifact_id: "artifact_021",
              title: "Digital Heritage Platform",
              description: "Interactive platform for exploring traditional craft techniques",
              type: "digital_prototype",
              file_paths: ["/images/heritage-platform-1.jpg", "/images/heritage-platform-2.jpg"],
              creation_date: "2024-11-23T12:20:00Z",
              w: 210,
              h: 140,
              tags: {
                materials: ["web", "multimedia", "database"],
                themes: ["heritage", "preservation", "culture"],
                techniques: ["web_design", "multimedia_production"],
                categories: ["cultural_design", "digital_heritage"]
              }
            },
            {
              artifact_id: "artifact_022",
              title: "Craft Documentation Kit",
              description: "Physical toolkit for documenting traditional craft processes",
              type: "physical_prototype",
              file_paths: ["/images/craft-kit-1.jpg"],
              creation_date: "2024-11-15T11:10:00Z",
              w: 160,
              h: 170,
              tags: {
                materials: ["cardboard", "documentation_tools", "templates"],
                themes: ["documentation", "crafts", "tradition"],
                techniques: ["documentation_design", "tool_design"],
                categories: ["documentation_tools", "cultural_preservation"]
              }
            }
          ]
        }
      ]
    },
    {
      student_id: "student_012",
      name: {
        first_name: "Chaahat",
        last_name: "Thakker",
        display_name: "Chaahat Thakker"
      },
      email: "chaahat.thakker@example.edu",
      student_number: "STU123012",
      enrollment_year: 2023,
      program: "Design Research",
      year_level: 3,
      projects: [
        {
          project_id: "project_012",
          title: "Mindful Technology Interactions",
          description: "Designing technology interfaces that promote mindful usage and digital wellbeing, exploring how design can encourage healthier relationships with digital devices and platforms.",
          course_code: "DESIGN401",
          semester: "Fall 2024",
          artifacts: [
            {
              artifact_id: "artifact_023",
              title: "Mindful Phone Interface",
              description: "Redesigned smartphone interface promoting mindful usage",
              type: "digital_prototype",
              file_paths: ["/images/mindful-phone-1.jpg", "/images/mindful-phone-2.jpg"],
              creation_date: "2024-11-22T15:45:00Z",
              w: 120,
              h: 200,
              tags: {
                materials: ["mobile", "interface", "app"],
                themes: ["mindfulness", "wellbeing", "technology"],
                techniques: ["app_design", "behavioral_design"],
                categories: ["mobile_design", "wellbeing_design"]
              }
            },
            {
              artifact_id: "artifact_024",
              title: "Digital Detox Toolkit",
              description: "Physical objects designed to support digital wellness practices",
              type: "physical_prototype",
              file_paths: ["/images/detox-toolkit-1.jpg"],
              creation_date: "2024-11-17T13:30:00Z",
              w: 180,
              h: 150,
              tags: {
                materials: ["wood", "fabric", "ceramics"],
                themes: ["digital_detox", "mindfulness", "wellness"],
                techniques: ["product_design", "material_exploration"],
                categories: ["product_design", "wellness_tools"]
              }
            }
          ]
        }
      ]
    }
  ]
};

export default studentsData;