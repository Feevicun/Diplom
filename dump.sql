--
-- PostgreSQL database dump
--

\restrict qQ5EwirRHvIbs0NJLfa7Tz8Ie3P788OJdpKHiD17m5pPfY87UdCjc1e6F3cmyoe

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_chat_timestamp(); Type: FUNCTION; Schema: public; Owner: vikaosoba
--

CREATE FUNCTION public.update_chat_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_chat_timestamp() OWNER TO vikaosoba;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    chat_id integer,
    sender_id integer,
    content text NOT NULL,
    attachment_name character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chat_messages OWNER TO vikaosoba;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_messages_id_seq OWNER TO vikaosoba;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: chat_participants; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.chat_participants (
    id integer NOT NULL,
    chat_id integer,
    user_id integer,
    joined_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chat_participants OWNER TO vikaosoba;

--
-- Name: chat_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.chat_participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_participants_id_seq OWNER TO vikaosoba;

--
-- Name: chat_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.chat_participants_id_seq OWNED BY public.chat_participants.id;


--
-- Name: chats; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.chats (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT chats_type_check CHECK (((type)::text = ANY (ARRAY[('direct'::character varying)::text, ('group'::character varying)::text])))
);


ALTER TABLE public.chats OWNER TO vikaosoba;

--
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chats_id_seq OWNER TO vikaosoba;

--
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;


--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.conversation_participants (
    conversation_id uuid NOT NULL,
    user_id integer NOT NULL,
    last_seen timestamp without time zone
);


ALTER TABLE public.conversation_participants OWNER TO vikaosoba;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    title character varying(255)
);


ALTER TABLE public.conversations OWNER TO vikaosoba;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    faculty_id integer,
    name character varying(255) NOT NULL
);


ALTER TABLE public.departments OWNER TO vikaosoba;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_id_seq OWNER TO vikaosoba;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.events (
    id integer NOT NULL,
    "userEmail" character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    date timestamp with time zone NOT NULL,
    type character varying(50) NOT NULL
);


ALTER TABLE public.events OWNER TO vikaosoba;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_id_seq OWNER TO vikaosoba;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: faculties; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.faculties (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.faculties OWNER TO vikaosoba;

--
-- Name: faculties_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.faculties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.faculties_id_seq OWNER TO vikaosoba;

--
-- Name: faculties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.faculties_id_seq OWNED BY public.faculties.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    student_email character varying(255) NOT NULL,
    receiver_email character varying(255) NOT NULL,
    attachment character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public.messages OWNER TO vikaosoba;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO vikaosoba;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    link character varying(500) NOT NULL,
    category character varying(100) DEFAULT 'other'::character varying NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.resources OWNER TO vikaosoba;

--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.resources_id_seq OWNER TO vikaosoba;

--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.teachers (
    id integer NOT NULL,
    full_name text NOT NULL,
    department_id integer
);


ALTER TABLE public.teachers OWNER TO vikaosoba;

--
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.teachers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teachers_id_seq OWNER TO vikaosoba;

--
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- Name: user_chapters; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.user_chapters (
    id integer NOT NULL,
    user_id integer,
    project_type character varying(50) NOT NULL,
    chapter_key character varying(50) NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    student_note text DEFAULT ''::text,
    uploaded_file_name character varying(255),
    uploaded_file_date timestamp without time zone,
    uploaded_file_size character varying(50),
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_chapters OWNER TO vikaosoba;

--
-- Name: user_chapters_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.user_chapters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_chapters_id_seq OWNER TO vikaosoba;

--
-- Name: user_chapters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.user_chapters_id_seq OWNED BY public.user_chapters.id;


--
-- Name: user_projects; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.user_projects (
    id integer NOT NULL,
    user_id integer NOT NULL,
    active_project_type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT user_projects_active_project_type_check CHECK (((active_project_type)::text = ANY (ARRAY[('diploma'::character varying)::text, ('coursework'::character varying)::text, ('practice'::character varying)::text])))
);


ALTER TABLE public.user_projects OWNER TO vikaosoba;

--
-- Name: user_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.user_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_projects_id_seq OWNER TO vikaosoba;

--
-- Name: user_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.user_projects_id_seq OWNED BY public.user_projects.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: vikaosoba
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    registeredat timestamp without time zone DEFAULT now() NOT NULL,
    lastloginat timestamp without time zone,
    lastlogoutat timestamp without time zone,
    faculty_id integer,
    department_id integer,
    avatar_url text,
    active_project_type character varying(50)
);


ALTER TABLE public.users OWNER TO vikaosoba;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: vikaosoba
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO vikaosoba;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikaosoba
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: chat_participants id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_participants ALTER COLUMN id SET DEFAULT nextval('public.chat_participants_id_seq'::regclass);


--
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: faculties id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.faculties ALTER COLUMN id SET DEFAULT nextval('public.faculties_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- Name: user_chapters id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_chapters ALTER COLUMN id SET DEFAULT nextval('public.user_chapters_id_seq'::regclass);


--
-- Name: user_projects id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_projects ALTER COLUMN id SET DEFAULT nextval('public.user_projects_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.chat_messages (id, chat_id, sender_id, content, attachment_name, created_at) FROM stdin;
\.


--
-- Data for Name: chat_participants; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.chat_participants (id, chat_id, user_id, joined_at) FROM stdin;
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.chats (id, name, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.conversation_participants (conversation_id, user_id, last_seen) FROM stdin;
1aa3abc8-c329-4e88-957e-d2e7cb1d78b9	21	\N
1aa3abc8-c329-4e88-957e-d2e7cb1d78b9	7	\N
07a7a6d5-dcf5-45bb-ad4d-25584167ee2e	3	\N
07a7a6d5-dcf5-45bb-ad4d-25584167ee2e	7	\N
574b6dd9-bb20-43bb-b412-efd51337042a	4	\N
574b6dd9-bb20-43bb-b412-efd51337042a	21	2025-08-12 23:12:42.273744
2c95a725-72e8-433e-a3c8-aea95c5b6f63	21	\N
2c95a725-72e8-433e-a3c8-aea95c5b6f63	4	2025-08-12 23:21:04.816049
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.conversations (id, created_at, updated_at, title) FROM stdin;
1aa3abc8-c329-4e88-957e-d2e7cb1d78b9	2025-08-12 23:01:32.419699	2025-08-12 23:01:32.419699	Chat 8/12/2025
07a7a6d5-dcf5-45bb-ad4d-25584167ee2e	2025-08-12 23:02:16.291553	2025-08-12 23:02:16.291553	Chat 8/12/2025
574b6dd9-bb20-43bb-b412-efd51337042a	2025-08-12 23:12:32.200022	2025-08-12 23:12:32.200022	Chat 8/12/2025
2c95a725-72e8-433e-a3c8-aea95c5b6f63	2025-08-12 23:20:50.664009	2025-08-12 23:20:50.664009	Chat 8/12/2025
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.departments (id, faculty_id, name) FROM stdin;
1	1	біофізики та біоінформатики
2	1	біохімії
3	1	ботаніки
4	1	генетики та біотехнології
5	1	зоології та екології тварин
6	1	мікробіології
7	1	фізіології людини та тварин
8	1	фізіології та екології рослин
9	1	екології
10	2	географії України
11	2	геоморфології і палеографії
12	2	ґрунтознавства і географії ґрунтів
13	2	економічної і соціальної географії
14	2	конструктивної географії та картографії
15	2	раціонального використання природних ресурсів і охорони природи
16	2	туризму
17	2	фізичної географії
18	3	геології корисних копалин і геофізики
19	3	екологічної та інженерної геології і гідрогеології
20	3	загальної та історичної геології і палеонтології
21	3	мінералогіїї, петрографії і геохімії
22	4	аналітичної економії і міжнародної економіки
23	4	банківського і страхового бізнесу
24	4	економічної кібернетики
25	4	економіки України
26	4	інформаційниї систем в менеджменті
27	4	маркетингу
28	4	менеджменту
29	4	обліку і аудиту
30	4	статистики
31	4	фінансів, грошового обліку і кредиту
32	5	оптоелектроніки та інформаційних технологій
33	5	радіоелектронних і компʼютерних систем
34	5	радіофізики та компʼютерних технологій
35	5	системного проектування
36	5	сенсорної та напівпровідникової електроніки
37	5	фізичної і біомедичної електроніки
38	6	зарубіжної преси та інформації
39	6	мови засобів масової інформації
40	6	української преси
41	7	англійської філології
42	7	класичної філології
43	7	німецької філології
44	7	світової літератури
45	7	французької та іспанської філології
46	7	міжкультурної комунікації та перекладу
47	8	новітньої історії України
48	8	давньої історії України та архівознавства
49	8	історії середніх віків та візантиністики
50	8	нової та новітньої історії
51	8	історії словʼянських країн
52	8	етнології
53	8	історичного краєзнавства
54	8	арехології та історії стародавнього світу
55	8	соціології
56	9	музичне мистецтво
57	9	режисури та хореографії
58	9	соціокультурного менеджменту
59	9	театрознавства та акторської майстерності
60	10	алгебри та логіки
61	10	геометрії та топології
62	10	диференціальних рівнянь
63	10	математичної економіки і економетрії
64	10	математичного моделювання
65	10	математчного і функціонального аналізу
66	10	теорії функцій і теорії ймовірностей
67	10	теортичної та прикладної статистики
68	10	механіки
69	10	вищої математики
70	11	міжнародного права
71	11	міжнародних економічних відносин
72	11	іноземних мов факультету міжнародних відносин
73	11	країнознавства і міжнародного туризму
74	11	міжнародних відносин і дипломатичної служби
75	11	міжнародного економічного аналізу і фінансів
76	11	європейського права
77	12	загальної педагогіки та педагогіки вищої школи
78	12	початкової та дошкільної освіти
79	12	соціальної педагогіки та соціальної роботи
80	12	соціальної освіти
81	12	фізичного виховання та спорту
82	13	обчислювальної математики
83	13	прикладної математики
84	13	теорії оптимальних процесів
85	13	програмування
86	13	інформаційних систем
87	13	математичного моделювання соціально-економічних процесів
88	13	дискретного аналізу та інтелектуальних систем
89	13	кібербезпеки
90	14	економіки та публічного управління
91	14	обліку, аналізу і контролю
92	14	публічного адміністрування та управління бізнесом
93	14	фінансових технологій та консалтингу
94	14	фінансового менеджменту
95	14	цифрової економіки та бізнес-аналітики
96	15	астрофізики
97	15	експериментальної фізики
98	15	загальної фізики
99	15	фізики металів
100	16	загального мовознавства
101	16	польської філології
102	16	словʼянської філології
103	16	сходознавства
104	16	української літератури
105	17	історії філософії
106	17	політології
107	17	психології
108	17	теорії та історії культури
109	17	теорії та історії політичної науки
110	17	філософії
111	18	аналітичної хімії
112	18	органічної хімії
113	18	неорганічної хімії
114	19	адміністративного та фінансового права
115	19	конституційного права
116	19	кримінального процесу і криміналістики
117	19	соціального права
118	19	цивільного права та процесу
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.events (id, "userEmail", title, date, type) FROM stdin;
1	vmmgkk@lnu.edu.ua	dddd	2025-08-09 20:53:59.435+00	deadline
2	vnvnfje@lnu.edu.ua	dddd	2025-08-08 21:00:00+00	task
3	Bodya.Dmytriv@lnu.edu.ua	fddf	2025-08-09 21:34:58.656+00	meeting
4	vmmgkk@lnu.edu.ua	rrrr	2025-08-12 08:35:43.494+00	meeting
5	vmmgkk@lnu.edu.ua	eewwdff	2025-08-12 08:36:04.027+00	task
6	viksjjfhr@lnu.edu.ua	ааа	2025-08-13 21:00:00+00	task
\.


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.faculties (id, name) FROM stdin;
1	Біологічний факультет
2	Географічний факультет
3	Геологічний факультет
4	Економічний факультет
5	Факультет електроніки та компʼютерних технологій
6	Факультет журналістики
7	Факультет іноземних мов
8	Історичний факультет
9	Факультет культури і мистецтв
10	Механіко-математичний факультет
11	Факультет міжнародних відносин
12	Факультет педагогічної освіти
13	Факультет прикладної математики та інформатики
14	Факультет управління фінансами та бізнесу
15	Фізичний факультет
16	Філологічний факультет
17	Філософський факультет
18	Хімічний факультет
19	Юридичний факультет
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.messages (id, sender, name, content, "timestamp", student_email, receiver_email, attachment) FROM stdin;
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.resources (id, title, description, link, category, created_by, created_at, updated_at) FROM stdin;
4	cvvcc	xxxxx	ddfre	guidelines	22	2025-09-01 20:29:00.141407+00	2025-09-01 20:29:00.141407+00
5	fjgnk n	kgmkfmle	kfgmngkkr	guidelines	22	2025-09-03 14:02:49.837877+00	2025-09-03 14:02:49.837877+00
6	off,mmdd	flfkmlrepfmdle	https://example.com	literature	22	2025-09-04 09:27:05.94505+00	2025-09-04 09:27:05.94505+00
7	ааа	мммм	https://мммм	templates	22	2025-09-04 15:09:58.015288+00	2025-09-04 15:09:58.015288+00
8	hjk	mmm	https://gtrfgg	templates	22	2025-09-04 15:46:59.677535+00	2025-09-04 15:46:59.677535+00
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.teachers (id, full_name, department_id) FROM stdin;
1	БАБСЬКИЙ Андрій Мирославович	1
2	БУРА Марта Володимирівна	1
3	ГАРАСИМ Наталія Петрівна	1
4	ГЕНЕГА Анастасія Богданівна	1
5	ДИКА Марія Василівна	1
6	ТАРНОВСЬКА Антоніна Володимирівна	1
7	ШАЛАЙ Ярина Романівна	1
8	СИБІРНА Наталія Олександрівна	2
9	БРОДЯК Ірина Володимирівна	2
10	ГАЧКОВА Галина Ярославівна	2
11	ЛЮТА Мар'яна Ярославівна	2
12	НАГАЛЄВСЬКА Марія Романівна	2
13	САБАДАШКА Марія Володимирівна	2
14	СТАСИК Олена Георгіївна	2
15	ГОНЧАРЕНКО Віталій Іванович	3
16	ТАСЄНКЕВИЧ Лідія Олексіївна	3
17	ДИКА Ольга Олегівна	3
18	НАЧИЧКО Віктор Олексійович	3
19	ОДІНЦОВА Анастасія Валеріївна	3
20	ПРОКОПІВ Андрій Іванович	3
21	ФЕДОРЕНКО Віктор Олександрович	4
22	БОДНАР Лідія Степанівна	4
23	ГОЛУБ Наталія Ярославівна	4
24	ГОРБУЛІНСЬКА Світлана Михайлівна	4
25	МАТІЙЦІВ Наталія Петрівна	4
26	СИРВАТКА Василь Ярославович	4
27	МАМЧУР Звенислава Ігорівна	9
28	АНТОНЯК Галина Леонідівна	9
29	КАПРУСЬ Ігор Ярославович	9
30	ДЖУРА Наталія Миронівна	9
31	РАГУЛІНА Марина Євгенівна	9
32	СЕНЬКІВ Віктор Миколайович	9
33	ЦВІЛИНЮК Ольга Миколаївна	9
34	ЦАРИК Йосиф Володимирович	5
35	БОКОТЕЙ Андрій Андрійович	5
36	ГНАТИНА Оксана Степанівна	5
37	ДИКИЙ Ігор Васильович	5
38	ІВАНЕЦЬ Олег Романович	5
39	НАЗАРУК Катерина Миколаївна	5
40	РЕШЕТИЛО Остап Степанович	5
41	ХАМАР Ігор Степанович	5
42	ГНАТУШ Світлана Олексіївна	6
43	ГАЛУШКА Андрій Андрійович	6
44	ЗВІР Галина Іванівна	6
45	КОЛІСНИК Ярина Іванівна	6
46	МАСЛОВСЬКА Ольга Дмитрівна	6
47	ПЕРЕТЯТКО Тарас Богданович	6
48	ЯВОРСЬКА Галина Василівна	6
\.


--
-- Data for Name: user_chapters; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.user_chapters (id, user_id, project_type, chapter_key, progress, status, student_note, uploaded_file_name, uploaded_file_date, uploaded_file_size, updated_at, created_at) FROM stdin;
81	9	diploma	abstract	0	pending		\N	\N	\N	2025-08-13 12:41:51.021679	2025-08-13 12:41:51.021679
84	9	diploma	cover	0	pending		\N	\N	\N	2025-08-13 12:41:51.022254	2025-08-13 12:41:51.022254
15	9	coursework	intro	0	pending		\N	\N	\N	2025-08-11 01:30:33.808359	2025-08-11 11:34:30.57178
16	9	coursework	theory	0	pending		\N	\N	\N	2025-08-11 01:30:33.809793	2025-08-11 11:34:30.57178
17	9	coursework	design	0	pending		\N	\N	\N	2025-08-11 01:30:33.810422	2025-08-11 11:34:30.57178
18	9	coursework	implementation	0	pending		\N	\N	\N	2025-08-11 01:30:33.810848	2025-08-11 11:34:30.57178
19	9	coursework	conclusion	0	pending		\N	\N	\N	2025-08-11 01:30:33.811216	2025-08-11 11:34:30.57178
20	9	coursework	appendix	0	pending		\N	\N	\N	2025-08-11 01:30:33.811607	2025-08-11 11:34:30.57178
21	9	coursework	sources	0	pending		\N	\N	\N	2025-08-11 01:30:33.812017	2025-08-11 11:34:30.57178
22	9	coursework	abstract	0	pending		\N	\N	\N	2025-08-11 01:30:33.812441	2025-08-11 11:34:30.57178
23	9	coursework	cover	0	pending		\N	\N	\N	2025-08-11 01:30:33.812858	2025-08-11 11:34:30.57178
24	9	coursework	content	0	pending		\N	\N	\N	2025-08-11 01:30:33.813357	2025-08-11 11:34:30.57178
25	21	coursework	intro	0	pending		\N	\N	\N	2025-08-11 11:35:02.016687	2025-08-11 11:35:02.016687
26	21	coursework	theory	0	pending		\N	\N	\N	2025-08-11 11:35:02.020711	2025-08-11 11:35:02.020711
27	21	coursework	design	0	pending		\N	\N	\N	2025-08-11 11:35:02.021298	2025-08-11 11:35:02.021298
28	21	coursework	conclusion	0	pending		\N	\N	\N	2025-08-11 11:35:02.021946	2025-08-11 11:35:02.021946
29	21	coursework	sources	0	pending		\N	\N	\N	2025-08-11 11:35:02.022787	2025-08-11 11:35:02.022787
30	21	coursework	appendix	0	pending		\N	\N	\N	2025-08-11 11:35:02.023296	2025-08-11 11:35:02.023296
31	21	coursework	cover	0	pending		\N	\N	\N	2025-08-11 11:35:02.02367	2025-08-11 11:35:02.02367
32	21	coursework	content	0	pending		\N	\N	\N	2025-08-11 11:35:02.023991	2025-08-11 11:35:02.023991
85	9	diploma	content	0	pending		\N	\N	\N	2025-08-13 12:41:51.022816	2025-08-13 12:41:51.022816
40	21	practice	intro	0	pending		\N	\N	\N	2025-08-11 11:35:32.837755	2025-08-11 11:35:32.837755
41	21	practice	tasks	0	pending		\N	\N	\N	2025-08-11 11:35:32.839274	2025-08-11 11:35:32.839274
42	21	practice	diary	0	pending		\N	\N	\N	2025-08-11 11:35:32.840156	2025-08-11 11:35:32.840156
43	21	practice	report	0	pending		\N	\N	\N	2025-08-11 11:35:32.840818	2025-08-11 11:35:32.840818
44	21	practice	conclusion	0	pending		\N	\N	\N	2025-08-11 11:35:32.841779	2025-08-11 11:35:32.841779
45	21	practice	sources	0	pending		\N	\N	\N	2025-08-11 11:35:32.844056	2025-08-11 11:35:32.844056
46	21	practice	appendix	0	pending		\N	\N	\N	2025-08-11 11:35:32.844739	2025-08-11 11:35:32.844739
147	10	diploma	intro	0	pending		\N	\N	\N	2025-08-14 18:28:02.295523	2025-08-14 18:28:02.295523
67	9	diploma	intro	0	pending		\N	\N	\N	2025-08-13 12:41:51.014505	2025-08-13 12:41:51.014505
69	9	diploma	theory	0	pending		\N	\N	\N	2025-08-13 12:41:51.017607	2025-08-13 12:41:51.017607
71	9	diploma	design	0	pending		\N	\N	\N	2025-08-13 12:41:51.018488	2025-08-13 12:41:51.018488
73	9	diploma	implementation	0	pending		\N	\N	\N	2025-08-13 12:41:51.019431	2025-08-13 12:41:51.019431
75	9	diploma	conclusion	0	pending		\N	\N	\N	2025-08-13 12:41:51.020071	2025-08-13 12:41:51.020071
77	9	diploma	sources	0	pending		\N	\N	\N	2025-08-13 12:41:51.020664	2025-08-13 12:41:51.020664
79	9	diploma	appendix	0	pending		\N	\N	\N	2025-08-13 12:41:51.021218	2025-08-13 12:41:51.021218
107	7	diploma	intro	0	pending		\N	\N	\N	2025-08-13 15:45:37.229029	2025-08-13 15:45:37.229029
108	7	diploma	theory	0	pending		\N	\N	\N	2025-08-13 15:45:37.230877	2025-08-13 15:45:37.230877
109	7	diploma	design	0	pending		\N	\N	\N	2025-08-13 15:45:37.2318	2025-08-13 15:45:37.2318
110	7	diploma	implementation	0	pending		\N	\N	\N	2025-08-13 15:45:37.232655	2025-08-13 15:45:37.232655
111	7	diploma	conclusion	0	pending		\N	\N	\N	2025-08-13 15:45:37.233593	2025-08-13 15:45:37.233593
112	7	diploma	sources	0	pending		\N	\N	\N	2025-08-13 15:45:37.234461	2025-08-13 15:45:37.234461
113	7	diploma	appendix	0	pending		\N	\N	\N	2025-08-13 15:45:37.235339	2025-08-13 15:45:37.235339
114	7	diploma	abstract	0	pending		\N	\N	\N	2025-08-13 15:45:37.236059	2025-08-13 15:45:37.236059
115	7	diploma	cover	0	pending		\N	\N	\N	2025-08-13 15:45:37.236517	2025-08-13 15:45:37.236517
116	7	diploma	content	0	pending		\N	\N	\N	2025-08-13 15:45:37.237155	2025-08-13 15:45:37.237155
121	4	diploma	design	0	pending		\N	\N	\N	2025-08-14 00:21:14.388306	2025-08-14 00:21:14.388306
123	4	diploma	implementation	0	pending		\N	\N	\N	2025-08-14 00:21:14.389353	2025-08-14 00:21:14.389353
125	4	diploma	conclusion	0	pending		\N	\N	\N	2025-08-14 00:21:14.39047	2025-08-14 00:21:14.39047
127	4	diploma	sources	0	pending		\N	\N	\N	2025-08-14 00:21:14.391653	2025-08-14 00:21:14.391653
129	4	diploma	appendix	0	pending		\N	\N	\N	2025-08-14 00:21:14.39314	2025-08-14 00:21:14.39314
131	4	diploma	abstract	0	pending		\N	\N	\N	2025-08-14 00:21:14.39411	2025-08-14 00:21:14.39411
133	4	diploma	cover	0	pending		\N	\N	\N	2025-08-14 00:21:14.394938	2025-08-14 00:21:14.394938
135	4	diploma	content	0	pending		\N	\N	\N	2025-08-14 00:21:14.395592	2025-08-14 00:21:14.395592
148	10	diploma	theory	0	pending		\N	\N	\N	2025-08-14 18:28:02.296595	2025-08-14 18:28:02.296595
118	4	diploma	intro	70	inProgress		diplom.pages	2025-08-14 00:21:18.606	1.4 MB	2025-08-14 00:21:19.872362	2025-08-14 00:21:14.384908
149	10	diploma	design	0	pending		\N	\N	\N	2025-08-14 18:28:02.29743	2025-08-14 18:28:02.29743
150	10	diploma	implementation	0	pending		\N	\N	\N	2025-08-14 18:28:02.29835	2025-08-14 18:28:02.29835
151	10	diploma	conclusion	0	pending		\N	\N	\N	2025-08-14 18:28:02.299189	2025-08-14 18:28:02.299189
152	10	diploma	sources	0	pending		\N	\N	\N	2025-08-14 18:28:02.300022	2025-08-14 18:28:02.300022
153	10	diploma	appendix	0	pending		\N	\N	\N	2025-08-14 18:28:02.300843	2025-08-14 18:28:02.300843
154	10	diploma	abstract	0	pending		\N	\N	\N	2025-08-14 18:28:02.301219	2025-08-14 18:28:02.301219
155	10	diploma	cover	0	pending		\N	\N	\N	2025-08-14 18:28:02.301545	2025-08-14 18:28:02.301545
156	10	diploma	content	0	pending		\N	\N	\N	2025-08-14 18:28:02.301858	2025-08-14 18:28:02.301858
171	6	diploma	abstract	0	pending		\N	\N	\N	2025-08-20 14:24:27.529407	2025-08-20 14:24:27.529407
119	4	diploma	theory	70	inProgress		diplom.pdf	2025-08-18 17:05:17.263	1.2 MB	2025-08-18 17:05:18.553123	2025-08-14 00:21:14.387294
157	6	diploma	intro	0	pending		\N	\N	\N	2025-08-20 14:24:27.517992	2025-08-20 14:24:27.517992
159	6	diploma	theory	0	pending		\N	\N	\N	2025-08-20 14:24:27.521889	2025-08-20 14:24:27.521889
161	6	diploma	design	0	pending		\N	\N	\N	2025-08-20 14:24:27.523446	2025-08-20 14:24:27.523446
163	6	diploma	implementation	0	pending		\N	\N	\N	2025-08-20 14:24:27.525674	2025-08-20 14:24:27.525674
165	6	diploma	conclusion	0	pending		\N	\N	\N	2025-08-20 14:24:27.526624	2025-08-20 14:24:27.526624
167	6	diploma	sources	0	pending		\N	\N	\N	2025-08-20 14:24:27.527556	2025-08-20 14:24:27.527556
169	6	diploma	appendix	0	pending		\N	\N	\N	2025-08-20 14:24:27.528472	2025-08-20 14:24:27.528472
173	6	diploma	cover	0	pending		\N	\N	\N	2025-08-20 14:24:27.530237	2025-08-20 14:24:27.530237
175	6	diploma	content	0	pending		\N	\N	\N	2025-08-20 14:24:27.531136	2025-08-20 14:24:27.531136
177	11	diploma	intro	0	pending		\N	\N	\N	2025-08-28 23:54:57.968742	2025-08-28 23:54:57.968742
179	11	diploma	theory	0	pending		\N	\N	\N	2025-08-28 23:54:57.970979	2025-08-28 23:54:57.970979
181	11	diploma	design	0	pending		\N	\N	\N	2025-08-28 23:54:57.971979	2025-08-28 23:54:57.971979
183	11	diploma	implementation	0	pending		\N	\N	\N	2025-08-28 23:54:57.972648	2025-08-28 23:54:57.972648
185	11	diploma	conclusion	0	pending		\N	\N	\N	2025-08-28 23:54:57.973429	2025-08-28 23:54:57.973429
187	11	diploma	sources	0	pending		\N	\N	\N	2025-08-28 23:54:57.974193	2025-08-28 23:54:57.974193
189	11	diploma	appendix	0	pending		\N	\N	\N	2025-08-28 23:54:57.974753	2025-08-28 23:54:57.974753
191	11	diploma	abstract	0	pending		\N	\N	\N	2025-08-28 23:54:57.975119	2025-08-28 23:54:57.975119
193	11	diploma	cover	0	pending		\N	\N	\N	2025-08-28 23:54:57.977736	2025-08-28 23:54:57.977736
195	11	diploma	content	0	pending		\N	\N	\N	2025-08-28 23:54:57.980168	2025-08-28 23:54:57.980168
\.


--
-- Data for Name: user_projects; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.user_projects (id, user_id, active_project_type, created_at, updated_at) FROM stdin;
2	21	practice	2025-08-11 11:20:21.5248	2025-08-11 11:35:32.833108
22	10	diploma	2025-08-11 11:36:21.295757	2025-08-14 18:28:02.293074
33	6	diploma	2025-08-20 14:24:27.501656	2025-08-20 14:24:27.50852
35	11	diploma	2025-08-28 23:54:57.950546	2025-08-28 23:54:57.960111
25	9	diploma	2025-08-13 12:41:51.007311	2025-08-13 12:41:51.004856
26	7	diploma	2025-08-13 15:42:54.445177	2025-08-13 15:45:37.22433
29	4	diploma	2025-08-14 00:21:14.3593	2025-08-14 00:21:14.379836
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: vikaosoba
--

COPY public.users (id, name, email, password, role, registeredat, lastloginat, lastlogoutat, faculty_id, department_id, avatar_url, active_project_type) FROM stdin;
2	mkvlfepe bbmfkrle	firieiwof@lnu.edu.ua	356787gfdd	student	2025-08-09 13:54:21.927355	\N	2025-08-09 14:23:40.384581	\N	\N	\N	\N
3	Vika Osoba	Osoba.Vika@lnu.edu.ua	FFJRJ4UI33	student	2025-08-09 14:01:30.23751	\N	2025-08-09 14:24:27.590601	\N	\N	\N	\N
14	Maks vnnmkr	kkgrke@lnu.edu.ua	mvmfj432	student	2025-08-09 17:12:41.008478	2025-08-10 11:05:06.854988	\N	\N	\N	\N	\N
8	Oleh vmkkfkfe	vmgkfir@lnu.edu.ua	fngmrke32	student	2025-08-09 14:33:32.793106	\N	\N	\N	\N	\N	\N
9	Ivan Osoba	vnvnfje@lnu.edu.ua	48858hfjr	student	2025-08-09 14:46:42.957911	2025-08-13 14:28:19.546072	2025-08-09 23:55:10.50922	\N	\N	\N	coursework
4	Viktoria Osoba	viksjjfhr@lnu.edu.ua	ri48rhjfjf	student	2025-08-09 14:04:35.815744	2025-08-18 17:04:45.586359	2025-08-09 15:00:11.958216	\N	\N	\N	\N
7	Oleh Dzydz	gkgkgkrk@lnu.edu.ua	vmfmkre2	student	2025-08-09 14:20:13.634379	2025-08-13 15:45:23.024741	2025-08-10 10:56:50.834995	\N	\N	\N	\N
5	vika jfkfkee	vnvmfje@lnu.edu.ua	484irjfkd	student	2025-08-09 14:08:18.894844	\N	2025-08-09 15:01:18.566164	\N	\N	\N	\N
6	Oleh Rylskiy	Oleh.Rylskiy@lnu.edu.ua	vnbngkkoe	student	2025-08-09 14:15:36.449472	2025-08-20 15:02:16.274393	2025-08-09 18:33:23.712133	\N	\N	\N	\N
13	Vlad Mmkfkrke	nvjfkk@lnu.edu.ua	mmfjeoef	student	2025-08-09 17:08:47.3555	2025-08-09 17:08:47.370776	\N	\N	\N	\N	\N
11	Viktor Osoba	lgkknmvmd@lnu.edu.ua	vvmfmkek332	student	2025-08-09 16:58:02.691048	2025-08-28 23:53:46.5973	2025-08-09 18:20:47.289364	\N	\N	\N	\N
15	kfkotfv mkklfddc	kgkfkf@lnu.edu.ua	vbnhy5433	student	2025-08-09 18:21:12.453496	2025-08-09 18:21:12.468285	2025-08-09 18:21:27.653952	\N	\N	\N	\N
12	vkgkfkr otoeoed	rgklgndm@lnu.edu.ua	vmgmrm433	student	2025-08-09 17:00:35.367985	2025-08-09 18:24:10.151573	2025-08-09 17:08:22.180008	\N	\N	\N	\N
16	Віка млелпа	fkkvmfmv@lnu.edu.ua	mvmkrk43	student	2025-08-09 18:27:46.670969	2025-08-09 18:27:46.68735	\N	\N	\N	\N	\N
17	kfkkkc ttrfvc	mvmfmmf@lnu.edu.ua	vmvmgkr44	student	2025-08-09 18:29:14.177802	2025-08-09 18:29:14.190801	\N	\N	\N	\N	\N
18	fkfkrd vmgkkr	fkgkgk@lnu.edu.ua	fmjgjgj	student	2025-08-09 18:33:43.956123	2025-08-09 18:33:43.967416	\N	\N	\N	\N	\N
19	mvmmblfr fkgkre	fmgmrke	85886854	student	2025-08-09 18:45:30.867546	2025-08-09 18:45:30.877109	\N	\N	\N	\N	\N
10	Marta Osoba	vmmgkk@lnu.edu.ua	123456	student	2025-08-09 15:00:30.535519	2025-09-01 23:14:57.313416	2025-09-01 22:03:03.226557	\N	\N	\N	diploma
20	vmvmmv rkgkfkd	gmmmff@lnu.edu.ua	r56yfffvfe	student	2025-08-09 18:54:56.986443	2025-08-09 18:54:57.000049	\N	\N	\N	\N	\N
22	Olha Bermuda	Olha.Bermuda@lnu.edu.ua	1234567	teacher	2025-09-01 22:03:57.368912	2025-09-04 17:53:26.216707	\N	17	107	\N	\N
21	Bodya Dmytriv	Bodya.Dmytriv@lnu.edu.ua	fjfjj84839	student	2025-08-10 00:31:52.059201	2025-09-09 06:36:48.213835	2025-09-03 17:01:58.356947	13	86	\N	coursework
\.


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 1, false);


--
-- Name: chat_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.chat_participants_id_seq', 1, false);


--
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.chats_id_seq', 1, false);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.departments_id_seq', 118, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.events_id_seq', 6, true);


--
-- Name: faculties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.faculties_id_seq', 19, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.resources_id_seq', 8, true);


--
-- Name: teachers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.teachers_id_seq', 48, true);


--
-- Name: user_chapters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.user_chapters_id_seq', 196, true);


--
-- Name: user_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.user_projects_id_seq', 36, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikaosoba
--

SELECT pg_catalog.setval('public.users_id_seq', 22, true);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_participants chat_participants_chat_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_chat_id_user_id_key UNIQUE (chat_id, user_id);


--
-- Name: chat_participants chat_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_pkey PRIMARY KEY (id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: faculties faculties_name_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_name_key UNIQUE (name);


--
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: user_chapters user_chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_chapters
    ADD CONSTRAINT user_chapters_pkey PRIMARY KEY (id);


--
-- Name: user_chapters user_chapters_user_project_chapter_unique; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_chapters
    ADD CONSTRAINT user_chapters_user_project_chapter_unique UNIQUE (user_id, project_type, chapter_key);


--
-- Name: user_projects user_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_pkey PRIMARY KEY (id);


--
-- Name: user_projects user_projects_user_id_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_chat_messages_chat_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages USING btree (chat_id);


--
-- Name: idx_chat_messages_created_at; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);


--
-- Name: idx_chat_participants_chat_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_chat_participants_chat_id ON public.chat_participants USING btree (chat_id);


--
-- Name: idx_chat_participants_user_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_chat_participants_user_id ON public.chat_participants USING btree (user_id);


--
-- Name: idx_resources_category; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_resources_category ON public.resources USING btree (category);


--
-- Name: idx_resources_created_at; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_resources_created_at ON public.resources USING btree (created_at);


--
-- Name: idx_resources_created_by; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_resources_created_by ON public.resources USING btree (created_by);


--
-- Name: idx_user_chapters_user_project; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_user_chapters_user_project ON public.user_chapters USING btree (user_id, project_type);


--
-- Name: idx_user_projects_user_id; Type: INDEX; Schema: public; Owner: vikaosoba
--

CREATE INDEX idx_user_projects_user_id ON public.user_projects USING btree (user_id);


--
-- Name: chats update_chats_updated_at; Type: TRIGGER; Schema: public; Owner: vikaosoba
--

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION public.update_chat_timestamp();


--
-- Name: chat_messages chat_messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_participants chat_participants_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_participants chat_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: departments departments_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id) ON DELETE CASCADE;


--
-- Name: resources resources_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teachers teachers_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: user_chapters user_chapters_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_chapters
    ADD CONSTRAINT user_chapters_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_projects user_projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikaosoba
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict qQ5EwirRHvIbs0NJLfa7Tz8Ie3P788OJdpKHiD17m5pPfY87UdCjc1e6F3cmyoe

