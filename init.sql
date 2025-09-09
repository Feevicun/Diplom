--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

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
    CONSTRAINT chats_type_check CHECK (((type)::text = ANY ((ARRAY['direct'::character varying, 'group'::character varying])::text[])))
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
    CONSTRAINT user_projects_active_project_type_check CHECK (((active_project_type)::text = ANY ((ARRAY['diploma'::character varying, 'coursework'::character varying, 'practice'::character varying])::text[])))
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

