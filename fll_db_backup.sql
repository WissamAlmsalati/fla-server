--
-- PostgreSQL database dump
--

\restrict zypzCST3LKdTYoh79SkJB63hIIXYsu8rUFrK4Q1fsfEEAFuquZXfrLQ77c8Ysgg

-- Dumped from database version 13.23 (Debian 13.23-0+deb11u1)
-- Dumped by pg_dump version 13.23 (Debian 13.23-0+deb11u1)

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
-- Name: Currency; Type: TYPE; Schema: public; Owner: wissam_dev
--

CREATE TYPE public."Currency" AS ENUM (
    'USD',
    'LYD',
    'CNY'
);


ALTER TYPE public."Currency" OWNER TO wissam_dev;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: wissam_dev
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'purchased',
    'arrived_to_china',
    'shipping_to_libya',
    'arrived_libya',
    'ready_for_pickup',
    'delivered',
    'canceled'
);


ALTER TYPE public."OrderStatus" OWNER TO wissam_dev;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: wissam_dev
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'PURCHASE_OFFICER',
    'CHINA_WAREHOUSE',
    'LIBYA_WAREHOUSE',
    'CUSTOMER'
);


ALTER TYPE public."Role" OWNER TO wissam_dev;

--
-- Name: ShipmentStatus; Type: TYPE; Schema: public; Owner: wissam_dev
--

CREATE TYPE public."ShipmentStatus" AS ENUM (
    'pending_inbound',
    'in_transit',
    'arrived',
    'ready_for_pickup',
    'delivered'
);


ALTER TYPE public."ShipmentStatus" OWNER TO wissam_dev;

--
-- Name: ShippingType; Type: TYPE; Schema: public; Owner: wissam_dev
--

CREATE TYPE public."ShippingType" AS ENUM (
    'AIR',
    'SEA'
);


ALTER TYPE public."ShippingType" OWNER TO wissam_dev;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: wissam_dev
--

CREATE TYPE public."TransactionType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL'
);


ALTER TYPE public."TransactionType" OWNER TO wissam_dev;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Announcement; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."Announcement" (
    id integer NOT NULL,
    title text NOT NULL,
    body text,
    "imageUrl" text NOT NULL,
    "actionUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Announcement" OWNER TO wissam_dev;

--
-- Name: Announcement_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."Announcement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Announcement_id_seq" OWNER TO wissam_dev;

--
-- Name: Announcement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."Announcement_id_seq" OWNED BY public."Announcement".id;


--
-- Name: Customer; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."Customer" (
    id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "dubaiCode" text,
    "usaCode" text,
    "turkeyCode" text,
    "balanceUSD" double precision DEFAULT 0 NOT NULL,
    "balanceLYD" double precision DEFAULT 0 NOT NULL,
    "balanceCNY" double precision DEFAULT 0 NOT NULL,
    "userId" integer
);


ALTER TABLE public."Customer" OWNER TO wissam_dev;

--
-- Name: Customer_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."Customer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Customer_id_seq" OWNER TO wissam_dev;

--
-- Name: Customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."Customer_id_seq" OWNED BY public."Customer".id;


--
-- Name: Flight; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."Flight" (
    id integer NOT NULL,
    "flightNumber" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "departureDate" timestamp(3) without time zone,
    "arrivalDate" timestamp(3) without time zone,
    country text DEFAULT 'CHINA'::text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    type public."ShippingType" DEFAULT 'AIR'::public."ShippingType"
);


ALTER TABLE public."Flight" OWNER TO wissam_dev;

--
-- Name: Flight_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."Flight_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Flight_id_seq" OWNER TO wissam_dev;

--
-- Name: Flight_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."Flight_id_seq" OWNED BY public."Flight".id;


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."Notification" (
    id integer NOT NULL,
    "userId" integer,
    title text NOT NULL,
    body text NOT NULL,
    type text DEFAULT 'SYSTEM'::text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "firebaseSent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "referenceId" integer
);


ALTER TABLE public."Notification" OWNER TO wissam_dev;

--
-- Name: Notification_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."Notification_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Notification_id_seq" OWNER TO wissam_dev;

--
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    "trackingNumber" text NOT NULL,
    name text NOT NULL,
    "usdPrice" double precision NOT NULL,
    "cnyPrice" double precision,
    "productUrl" text,
    notes text,
    status public."OrderStatus" DEFAULT 'purchased'::public."OrderStatus" NOT NULL,
    weight double precision,
    "customerId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "shippingRateId" integer,
    "shippingCost" double precision,
    "shippingRateName" text,
    "shippingRatePrice" double precision,
    country text DEFAULT 'CHINA'::text,
    "flightNumber" text,
    "flightId" integer
);


ALTER TABLE public."Order" OWNER TO wissam_dev;

--
-- Name: OrderLog; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."OrderLog" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    status public."OrderStatus" NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderLog" OWNER TO wissam_dev;

--
-- Name: OrderLog_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."OrderLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."OrderLog_id_seq" OWNER TO wissam_dev;

--
-- Name: OrderLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."OrderLog_id_seq" OWNED BY public."OrderLog".id;


--
-- Name: OrderMessage; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."OrderMessage" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "authorId" integer NOT NULL,
    content text NOT NULL,
    "imageUrl" text,
    "readBy" integer[] DEFAULT ARRAY[]::integer[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "replyToId" integer
);


ALTER TABLE public."OrderMessage" OWNER TO wissam_dev;

--
-- Name: OrderMessage_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."OrderMessage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."OrderMessage_id_seq" OWNER TO wissam_dev;

--
-- Name: OrderMessage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."OrderMessage_id_seq" OWNED BY public."OrderMessage".id;


--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Order_id_seq" OWNER TO wissam_dev;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: PasswordResetCode; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."PasswordResetCode" (
    id integer NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordResetCode" OWNER TO wissam_dev;

--
-- Name: PasswordResetCode_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."PasswordResetCode_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PasswordResetCode_id_seq" OWNER TO wissam_dev;

--
-- Name: PasswordResetCode_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."PasswordResetCode_id_seq" OWNED BY public."PasswordResetCode".id;


--
-- Name: PendingRegistration; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."PendingRegistration" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    mobile text NOT NULL,
    otp text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fcmToken" text,
    location text
);


ALTER TABLE public."PendingRegistration" OWNER TO wissam_dev;

--
-- Name: PendingRegistration_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."PendingRegistration_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PendingRegistration_id_seq" OWNER TO wissam_dev;

--
-- Name: PendingRegistration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."PendingRegistration_id_seq" OWNED BY public."PendingRegistration".id;


--
-- Name: SettingsChangeLog; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."SettingsChangeLog" (
    id integer NOT NULL,
    "settingKey" text NOT NULL,
    "changedById" integer NOT NULL,
    "changedByName" text NOT NULL,
    note text,
    "diffSummary" text,
    snapshot text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SettingsChangeLog" OWNER TO wissam_dev;

--
-- Name: SettingsChangeLog_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."SettingsChangeLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SettingsChangeLog_id_seq" OWNER TO wissam_dev;

--
-- Name: SettingsChangeLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."SettingsChangeLog_id_seq" OWNED BY public."SettingsChangeLog".id;


--
-- Name: Shipment; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."Shipment" (
    id integer NOT NULL,
    "shipmentId" text NOT NULL,
    weight double precision NOT NULL,
    "fromWarehouseId" integer NOT NULL,
    "toWarehouseId" integer NOT NULL,
    status public."ShipmentStatus" DEFAULT 'pending_inbound'::public."ShipmentStatus" NOT NULL
);


ALTER TABLE public."Shipment" OWNER TO wissam_dev;

--
-- Name: ShipmentItem; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."ShipmentItem" (
    id integer NOT NULL,
    "shipmentId" integer NOT NULL,
    "orderId" integer NOT NULL
);


ALTER TABLE public."ShipmentItem" OWNER TO wissam_dev;

--
-- Name: ShipmentItem_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."ShipmentItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ShipmentItem_id_seq" OWNER TO wissam_dev;

--
-- Name: ShipmentItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."ShipmentItem_id_seq" OWNED BY public."ShipmentItem".id;


--
-- Name: Shipment_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."Shipment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Shipment_id_seq" OWNER TO wissam_dev;

--
-- Name: Shipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."Shipment_id_seq" OWNED BY public."Shipment".id;


--
-- Name: ShippingRate; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."ShippingRate" (
    id integer NOT NULL,
    type public."ShippingType" NOT NULL,
    name text NOT NULL,
    price double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    country text DEFAULT 'CHINA'::text
);


ALTER TABLE public."ShippingRate" OWNER TO wissam_dev;

--
-- Name: ShippingRate_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."ShippingRate_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ShippingRate_id_seq" OWNER TO wissam_dev;

--
-- Name: ShippingRate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."ShippingRate_id_seq" OWNED BY public."ShippingRate".id;


--
-- Name: SiteSettings; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."SiteSettings" (
    key text NOT NULL,
    value text NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."SiteSettings" OWNER TO wissam_dev;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."Transaction" (
    id integer NOT NULL,
    "customerId" integer NOT NULL,
    type public."TransactionType" NOT NULL,
    amount double precision NOT NULL,
    currency public."Currency" NOT NULL,
    "balanceBefore" double precision NOT NULL,
    "balanceAfter" double precision NOT NULL,
    notes text,
    "createdBy" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO wissam_dev;

--
-- Name: Transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."Transaction_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Transaction_id_seq" OWNER TO wissam_dev;

--
-- Name: Transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."Transaction_id_seq" OWNED BY public."Transaction".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text,
    "passwordHash" text NOT NULL,
    role public."Role" NOT NULL,
    "customerId" integer,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    mobile text,
    "photoUrl" text,
    "passportUrl" text,
    suspended boolean DEFAULT false NOT NULL,
    approved boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fcmTokens" text[] DEFAULT ARRAY[]::text[],
    location text
);


ALTER TABLE public."User" OWNER TO wissam_dev;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO wissam_dev;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Warehouse; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public."Warehouse" (
    id integer NOT NULL,
    name text NOT NULL,
    country text NOT NULL
);


ALTER TABLE public."Warehouse" OWNER TO wissam_dev;

--
-- Name: Warehouse_id_seq; Type: SEQUENCE; Schema: public; Owner: wissam_dev
--

CREATE SEQUENCE public."Warehouse_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Warehouse_id_seq" OWNER TO wissam_dev;

--
-- Name: Warehouse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wissam_dev
--

ALTER SEQUENCE public."Warehouse_id_seq" OWNED BY public."Warehouse".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: wissam_dev
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO wissam_dev;

--
-- Name: Announcement id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Announcement" ALTER COLUMN id SET DEFAULT nextval('public."Announcement_id_seq"'::regclass);


--
-- Name: Customer id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Customer" ALTER COLUMN id SET DEFAULT nextval('public."Customer_id_seq"'::regclass);


--
-- Name: Flight id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Flight" ALTER COLUMN id SET DEFAULT nextval('public."Flight_id_seq"'::regclass);


--
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: OrderLog id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."OrderLog" ALTER COLUMN id SET DEFAULT nextval('public."OrderLog_id_seq"'::regclass);


--
-- Name: OrderMessage id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."OrderMessage" ALTER COLUMN id SET DEFAULT nextval('public."OrderMessage_id_seq"'::regclass);


--
-- Name: PasswordResetCode id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."PasswordResetCode" ALTER COLUMN id SET DEFAULT nextval('public."PasswordResetCode_id_seq"'::regclass);


--
-- Name: PendingRegistration id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."PendingRegistration" ALTER COLUMN id SET DEFAULT nextval('public."PendingRegistration_id_seq"'::regclass);


--
-- Name: SettingsChangeLog id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."SettingsChangeLog" ALTER COLUMN id SET DEFAULT nextval('public."SettingsChangeLog_id_seq"'::regclass);


--
-- Name: Shipment id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Shipment" ALTER COLUMN id SET DEFAULT nextval('public."Shipment_id_seq"'::regclass);


--
-- Name: ShipmentItem id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."ShipmentItem" ALTER COLUMN id SET DEFAULT nextval('public."ShipmentItem_id_seq"'::regclass);


--
-- Name: ShippingRate id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."ShippingRate" ALTER COLUMN id SET DEFAULT nextval('public."ShippingRate_id_seq"'::regclass);


--
-- Name: Transaction id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Transaction" ALTER COLUMN id SET DEFAULT nextval('public."Transaction_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: Warehouse id; Type: DEFAULT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Warehouse" ALTER COLUMN id SET DEFAULT nextval('public."Warehouse_id_seq"'::regclass);


--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."Announcement" (id, title, body, "imageUrl", "actionUrl", "isActive", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."Customer" (id, name, code, "dubaiCode", "usaCode", "turkeyCode", "balanceUSD", "balanceLYD", "balanceCNY", "userId") FROM stdin;
1	محمد شراطة	KO219-FLL1	BSB FLL D1	Global FLL 1	ABUHAJ FLL1	0	0	0	2
3	محمد ابوقحص	KO219-FLL3	BSB FLL D3	Global FLL 3	ABUHAJ FLL3	0	0	0	4
4	محمد ابورقيقة	KO219-FLL4	BSB FLL D4	Global FLL 4	ABUHAJ FLL4	0	0	0	5
5	فايز دعباج	KO219-FLL5	BSB FLL D5	Global FLL 5	ABUHAJ FLL5	0	0	0	6
6	عبدو الدرناوي	KO219-FLL6	BSB FLL D6	Global FLL 6	ABUHAJ FLL6	0	0	0	7
7	احمد القنباوي	KO219-FLL7	BSB FLL D7	Global FLL 7	ABUHAJ FLL7	0	0	0	8
8	ابتهاج حمد	KO219-FLL8	BSB FLL D8	Global FLL 8	ABUHAJ FLL8	0	0	0	9
9	ريان ابوزنقرة	KO219-FLL9	BSB FLL D9	Global FLL 9	ABUHAJ FLL9	0	0	0	10
10	علي العنكفي	KO219-FLL10	BSB FLL D10	Global FLL 10	ABUHAJ FLL10	0	0	0	11
11	عبدالحميد النقاصة	KO219-FLL11	BSB FLL D11	Global FLL 11	ABUHAJ FLL11	0	0	0	12
12	ناصر عبدالكريم	KO219-FLL12	BSB FLL D12	Global FLL 12	ABUHAJ FLL12	0	0	0	13
13	بشرى عامر	KO219-FLL13	BSB FLL D13	Global FLL 13	ABUHAJ FLL13	0	0	0	14
14	مسعود عبدالكريم	KO219-FLL14	BSB FLL D14	Global FLL 14	ABUHAJ FLL14	0	0	0	15
15	عدي المصراتي	KO219-FLL15	BSB FLL D15	Global FLL 15	ABUHAJ FLL15	0	0	0	16
16	وليد بن فايد	KO219-FLL16	BSB FLL D16	Global FLL 16	ABUHAJ FLL16	0	0	0	17
17	أحمد الجبالي	KO219-FLL17	BSB FLL D17	Global FLL 17	ABUHAJ FLL17	0	0	0	18
18	محمود سريول	KO219-FLL18	BSB FLL D18	Global FLL 18	ABUHAJ FLL18	0	0	0	19
20	أمينة علي	KO219-FLL20	BSB FLL D20	Global FLL 20	ABUHAJ FLL20	0	0	0	21
21	محمد عبدالله	KO219-FLL21	BSB FLL D21	Global FLL 21	ABUHAJ FLL21	0	0	0	22
22	صالح اعظيم	KO219-FLL22	BSB FLL D22	Global FLL 22	ABUHAJ FLL22	0	0	0	23
24	صيري الزاوية	KO219-FLL24	BSB FLL D24	Global FLL 24	ABUHAJ FLL24	0	0	0	25
25	نجلاء الفيتوري	KO219-FLL25	BSB FLL D25	Global FLL 25	ABUHAJ FLL25	0	0	0	26
26	محمد ناجي	KO219-FLL26	BSB FLL D26	Global FLL 26	ABUHAJ FLL26	0	0	0	27
27	انسام	KO219-FLL27	BSB FLL D27	Global FLL 27	ABUHAJ FLL27	0	0	0	28
28	ابوبكر الشهوبي	KO219-FLL28	BSB FLL D28	Global FLL 28	ABUHAJ FLL28	0	0	0	29
29	عائشة عون	KO219-FLL29	BSB FLL D29	Global FLL 29	ABUHAJ FLL29	0	0	0	30
30	محمد العمراني	KO219-FLL30	BSB FLL D30	Global FLL 30	ABUHAJ FLL30	0	0	0	31
31	رائد ديره	KO219-FLL31	BSB FLL D31	Global FLL 31	ABUHAJ FLL31	0	0	0	32
32	محمد الزليطني	KO219-FLL32	BSB FLL D32	Global FLL 32	ABUHAJ FLL32	0	0	0	33
33	سعد جمعة	KO219-FLL33	BSB FLL D33	Global FLL 33	ABUHAJ FLL33	0	0	0	34
34	علي كريم	KO219-FLL34	BSB FLL D34	Global FLL 34	ABUHAJ FLL34	0	0	0	35
35	اينور خالد	KO219-FLL35	BSB FLL D35	Global FLL 35	ABUHAJ FLL35	0	0	0	36
37	عزو بومكاتيب	KO219-FLL37	BSB FLL D37	Global FLL 37	ABUHAJ FLL37	0	0	0	38
38	وسيم البوزيدي	KO219-FLL38	BSB FLL D38	Global FLL 38	ABUHAJ FLL38	0	0	0	39
39	محمد البزن	KO219-FLL39	BSB FLL D39	Global FLL 39	ABUHAJ FLL39	0	0	0	40
40	متجر اليقين	KO219-FLL40	BSB FLL D40	Global FLL 40	ABUHAJ FLL40	0	0	0	41
41	معاذ الاطرش	KO219-FLL41	BSB FLL D41	Global FLL 41	ABUHAJ FLL41	0	0	0	42
42	احمد المجعوك	KO219-FLL42	BSB FLL D42	Global FLL 42	ABUHAJ FLL42	0	0	0	43
43	احمد النامي	KO219-FLL43	BSB FLL D43	Global FLL 43	ABUHAJ FLL43	0	0	0	44
44	احمد اشكال	KO219-FLL44	BSB FLL D44	Global FLL 44	ABUHAJ FLL44	0	0	0	45
45	احمد مريغان	KO219-FLL45	BSB FLL D45	Global FLL 45	ABUHAJ FLL45	0	0	0	46
46	ندى سهواكة	KO219-FLL46	BSB FLL D46	Global FLL 46	ABUHAJ FLL46	0	0	0	47
47	احمد المزوغي	KO219-FLL47	BSB FLL D47	Global FLL 47	ABUHAJ FLL47	0	0	0	48
48	احمد عيد 	KO219-FLL48	BSB FLL D48	Global FLL 48	ABUHAJ FLL48	0	0	0	49
49	معتز العوراني	KO219-FLL49	BSB FLL D49	Global FLL 49	ABUHAJ FLL49	0	0	0	50
50	عامر عون	KO219-FLL50	BSB FLL D50	Global FLL 50	ABUHAJ FLL50	0	0	0	51
51	مسعودة الزين	KO219-FLL51	BSB FLL D51	Global FLL 51	ABUHAJ FLL51	0	0	0	52
52	عبدالرحمن الطبال	KO219-FLL52	BSB FLL D52	Global FLL 52	ABUHAJ FLL52	0	0	0	53
53	محمد الغرياني	KO219-FLL53	BSB FLL D53	Global FLL 53	ABUHAJ FLL53	0	0	0	54
54	احمد الذيب	KO219-FLL54	BSB FLL D54	Global FLL 54	ABUHAJ FLL54	0	0	0	55
55	تجارب فواتير	KO219-FLL55	BSB FLL D55	Global FLL 55	ABUHAJ FLL55	0	0	0	56
56	احمد برباش	KO219-FLL56	BSB FLL D56	Global FLL 56	ABUHAJ FLL56	0	0	0	57
57	فيصل المجبري	KO219-FLL57	BSB FLL D57	Global FLL 57	ABUHAJ FLL57	0	0	0	58
58	تاج زيدان	KO219-FLL58	BSB FLL D58	Global FLL 58	ABUHAJ FLL58	0	0	0	59
19	عبدالمالك عثمان	KO219-FLL19	BSB FLL D19	Global FLL 19	ABUHAJ FLL19	-15	0	0	20
2	مهاب الحامدي	KO219-FLL2	BSB FLL D2	Global FLL 2	ABUHAJ FLL2	-1012	0	0	3
59	محمد الشريف	KO219-FLL59	BSB FLL D59	Global FLL 59	ABUHAJ FLL59	0	0	0	60
60	ابرار 	KO219-FLL60	BSB FLL D60	Global FLL 60	ABUHAJ FLL60	0	0	0	61
61	احلام يزيد	KO219-FLL61	BSB FLL D61	Global FLL 61	ABUHAJ FLL61	0	0	0	62
62	احمد الزاوي	KO219-FLL62	BSB FLL D62	Global FLL 62	ABUHAJ FLL62	0	0	0	63
63	واثق ميلاد	KO219-FLL63	BSB FLL D63	Global FLL 63	ABUHAJ FLL63	0	0	0	64
64	مهند بالحاج	KO219-FLL64	BSB FLL D64	Global FLL 64	ABUHAJ FLL64	0	0	0	65
65	حمزة الفرع	KO219-FLL65	BSB FLL D65	Global FLL 65	ABUHAJ FLL65	0	0	0	66
66	ربيع موسى	KO219-FLL66	BSB FLL D66	Global FLL 66	ABUHAJ FLL66	0	0	0	67
68	انس عبدالغني	KO219-FLL68	BSB FLL D68	Global FLL 68	ABUHAJ FLL68	0	0	0	69
69	مفتاح اشقيفة	KO219-FLL69	BSB FLL D69	Global FLL 69	ABUHAJ FLL69	0	0	0	70
70	نورا احمد 	KO219-FLL70	BSB FLL D70	Global FLL 70	ABUHAJ FLL70	0	0	0	71
71	مرام نوير	KO219-FLL71	BSB FLL D71	Global FLL 71	ABUHAJ FLL71	0	0	0	72
72	فاطمة الشريف	KO219-FLL72	BSB FLL D72	Global FLL 72	ABUHAJ FLL72	0	0	0	73
73	شاهين حكومة	KO219-FLL73	BSB FLL D73	Global FLL 73	ABUHAJ FLL73	0	0	0	74
74	احمد اشتيوي	KO219-FLL74	BSB FLL D74	Global FLL 74	ABUHAJ FLL74	0	0	0	75
75	معتصم	KO219-FLL75	BSB FLL D75	Global FLL 75	ABUHAJ FLL75	0	0	0	76
76	اماني عمر	KO219-FLL76	BSB FLL D76	Global FLL 76	ABUHAJ FLL76	0	0	0	77
77	اريج علي	KO219-FLL77	BSB FLL D77	Global FLL 77	ABUHAJ FLL77	0	0	0	78
78	يونس بالقاسم	KO219-FLL78	BSB FLL D78	Global FLL 78	ABUHAJ FLL78	0	0	0	79
79	فداء بنيني	KO219-FLL79	BSB FLL D79	Global FLL 79	ABUHAJ FLL79	0	0	0	80
80	تميم عبدالمجيد لياس	KO219-FLL80	BSB FLL D80	Global FLL 80	ABUHAJ FLL80	0	0	0	81
81	خلود الجفرة	KO219-FLL81	BSB FLL D81	Global FLL 81	ABUHAJ FLL81	0	0	0	82
82	ريم حناينية	KO219-FLL82	BSB FLL D82	Global FLL 82	ABUHAJ FLL82	0	0	0	83
83	اسامة البريكي	KO219-FLL83	BSB FLL D83	Global FLL 83	ABUHAJ FLL83	0	0	0	84
84	محمد بودقاقة	KO219-FLL84	BSB FLL D84	Global FLL 84	ABUHAJ FLL84	0	0	0	85
85	مالك مفتاح	KO219-FLL85	BSB FLL D85	Global FLL 85	ABUHAJ FLL85	0	0	0	86
86	سامر الادريس	KO219-FLL86	BSB FLL D86	Global FLL 86	ABUHAJ FLL86	0	0	0	87
87	ديانا نوار	KO219-FLL87	BSB FLL D87	Global FLL 87	ABUHAJ FLL87	0	0	0	88
88	ام كلثوم 	KO219-FLL88	BSB FLL D88	Global FLL 88	ABUHAJ FLL88	0	0	0	89
89	تقي العربي	KO219-FLL89	BSB FLL D89	Global FLL 89	ABUHAJ FLL89	0	0	0	90
90	وجدان الفيتوري	KO219-FLL90	BSB FLL D90	Global FLL 90	ABUHAJ FLL90	0	0	0	91
91	عبدالله الراجحي	KO219-FLL91	BSB FLL D91	Global FLL 91	ABUHAJ FLL91	0	0	0	92
92	صابرين عثمان	KO219-FLL92	BSB FLL D92	Global FLL 92	ABUHAJ FLL92	0	0	0	93
93	عبدالناصر تيجي	KO219-FLL93	BSB FLL D93	Global FLL 93	ABUHAJ FLL93	0	0	0	94
94	خليفة احمد	KO219-FLL94	BSB FLL D94	Global FLL 94	ABUHAJ FLL94	0	0	0	95
95	رتاج عمر	KO219-FLL95	BSB FLL D95	Global FLL 95	ABUHAJ FLL95	0	0	0	96
96	نور عبدالواحد	KO219-FLL96	BSB FLL D96	Global FLL 96	ABUHAJ FLL96	0	0	0	97
97	علا المسلاتي	KO219-FLL97	BSB FLL D97	Global FLL 97	ABUHAJ FLL97	0	0	0	98
98	عبدو النعاجي	KO219-FLL98	BSB FLL D98	Global FLL 98	ABUHAJ FLL98	0	0	0	99
99	دعاء البدري	KO219-FLL99	BSB FLL D99	Global FLL 99	ABUHAJ FLL99	0	0	0	100
100	رتاج القماطي	KO219-FLL100	BSB FLL D100	Global FLL 100	ABUHAJ FLL100	0	0	0	101
101	فريد احمد	KO219-FLL101	BSB FLL D101	Global FLL 101	ABUHAJ FLL101	0	0	0	102
102	محمد المعداني	KO219-FLL102	BSB FLL D102	Global FLL 102	ABUHAJ FLL102	0	0	0	103
103	هارون السويح	KO219-FLL103	BSB FLL D103	Global FLL 103	ABUHAJ FLL103	0	0	0	104
104	خميس الزنبري	KO219-FLL104	BSB FLL D104	Global FLL 104	ABUHAJ FLL104	0	0	0	105
105	محمد زايد	KO219-FLL105	BSB FLL D105	Global FLL 105	ABUHAJ FLL105	0	0	0	106
106	حنان زايد	KO219-FLL106	BSB FLL D106	Global FLL 106	ABUHAJ FLL106	0	0	0	107
107	عبدالله عامر الذيب 	KO219-FLL107	BSB FLL D107	Global FLL 107	ABUHAJ FLL107	0	0	0	108
108	حنان المنتصر	KO219-FLL108	BSB FLL D108	Global FLL 108	ABUHAJ FLL108	0	0	0	109
109	ابوبكر الطشاني	KO219-FLL109	BSB FLL D109	Global FLL 109	ABUHAJ FLL109	0	0	0	110
110	عمر الحارس	KO219-FLL110	BSB FLL D110	Global FLL 110	ABUHAJ FLL110	0	0	0	111
111	هاجر المشلوم 	KO219-FLL111	BSB FLL D111	Global FLL 111	ABUHAJ FLL111	0	0	0	112
112	سيف الإسلام سامي	KO219-FLL112	BSB FLL D112	Global FLL 112	ABUHAJ FLL112	0	0	0	113
113	عبدالرزاق الشعلة	KO219-FLL113	BSB FLL D113	Global FLL 113	ABUHAJ FLL113	0	0	0	114
114	اية المصراتي 	KO219-FLL114	BSB FLL D114	Global FLL 114	ABUHAJ FLL114	0	0	0	115
115	رامي ريان	KO219-FLL115	BSB FLL D115	Global FLL 115	ABUHAJ FLL115	0	0	0	116
116	معاذ ورشفاني	KO219-FLL116	BSB FLL D116	Global FLL 116	ABUHAJ FLL116	0	0	0	117
117	علي معتوق	KO219-FLL117	BSB FLL D117	Global FLL 117	ABUHAJ FLL117	0	0	0	118
23	احمد اغا	KO219-FLL23	BSB FLL D23	Global FLL 23	ABUHAJ FLL23	-100	0	0	24
118	ريحان 	KO219-FLL118	BSB FLL D118	Global FLL 118	ABUHAJ FLL118	0	0	0	119
119	عبدالواحد سوق الجمعة	KO219-FLL119	BSB FLL D119	Global FLL 119	ABUHAJ FLL119	0	0	0	120
120	ولاء أحمد	KO219-FLL120	BSB FLL D120	Global FLL 120	ABUHAJ FLL120	0	0	0	121
121	مسعود دومه	KO219-FLL121	BSB FLL D121	Global FLL 121	ABUHAJ FLL121	0	0	0	122
122	ايمان السيليني	KO219-FLL122	BSB FLL D122	Global FLL 122	ABUHAJ FLL122	0	0	0	123
123	رتاج اسماعيل	KO219-FLL123	BSB FLL D123	Global FLL 123	ABUHAJ FLL123	0	0	0	124
124	احمد بن عامر	KO219-FLL124	BSB FLL D124	Global FLL 124	ABUHAJ FLL124	0	0	0	125
125	روان علي	KO219-FLL125	BSB FLL D125	Global FLL 125	ABUHAJ FLL125	0	0	0	126
126	مرام سليم	KO219-FLL126	BSB FLL D126	Global FLL 126	ABUHAJ FLL126	0	0	0	127
127	هداية الكريكشي	KO219-FLL127	BSB FLL D127	Global FLL 127	ABUHAJ FLL127	0	0	0	128
128	زينب محمد 	KO219-FLL128	BSB FLL D128	Global FLL 128	ABUHAJ FLL128	0	0	0	129
129	محمد حسن	KO219-FLL129	BSB FLL D129	Global FLL 129	ABUHAJ FLL129	0	0	0	130
130	محمد حمودة 	KO219-FLL130	BSB FLL D130	Global FLL 130	ABUHAJ FLL130	0	0	0	131
131	انيس محمد	KO219-FLL131	BSB FLL D131	Global FLL 131	ABUHAJ FLL131	0	0	0	132
132	حمزة سويسي 	KO219-FLL132	BSB FLL D132	Global FLL 132	ABUHAJ FLL132	0	0	0	133
133	شهد عبدالحكيم	KO219-FLL133	BSB FLL D133	Global FLL 133	ABUHAJ FLL133	0	0	0	134
134	امحمد البيرة	KO219-FLL134	BSB FLL D134	Global FLL 134	ABUHAJ FLL134	0	0	0	135
135	امنة الحكيم	KO219-FLL135	BSB FLL D135	Global FLL 135	ABUHAJ FLL135	0	0	0	136
136	هالة عمر	KO219-FLL136	BSB FLL D136	Global FLL 136	ABUHAJ FLL136	0	0	0	137
137	مبلاد 	KO219-FLL137	BSB FLL D137	Global FLL 137	ABUHAJ FLL137	0	0	0	138
138	مريم جابر	KO219-FLL138	BSB FLL D138	Global FLL 138	ABUHAJ FLL138	0	0	0	139
139	تغريد زقلام	KO219-FLL139	BSB FLL D139	Global FLL 139	ABUHAJ FLL139	0	0	0	140
140	اية علي	KO219-FLL140	BSB FLL D140	Global FLL 140	ABUHAJ FLL140	0	0	0	141
141	محمد ابراهيم	KO219-FLL141	BSB FLL D141	Global FLL 141	ABUHAJ FLL141	0	0	0	142
142	احمد الصكلول	KO219-FLL142	BSB FLL D142	Global FLL 142	ABUHAJ FLL142	0	0	0	143
143	ميسي المجال وسام	KO219-FLL143	BSB FLL D143	Global FLL 143	ABUHAJ FLL143	0	0	0	144
144	احمد البرعصي	KO219-FLL144	BSB FLL D144	Global FLL 144	ABUHAJ FLL144	0	0	0	145
145	وسام الصبراتي	KO219-FLL145	BSB FLL D145	Global FLL 145	ABUHAJ FLL145	0	0	0	146
146	نور العوكلي	KO219-FLL146	BSB FLL D146	Global FLL 146	ABUHAJ FLL146	0	0	0	147
147	مكتبة الرائد	KO219-FLL147	BSB FLL D147	Global FLL 147	ABUHAJ FLL147	0	0	0	148
148	رضا انبيه	KO219-FLL148	BSB FLL D148	Global FLL 148	ABUHAJ FLL148	0	0	0	149
149	اروى خليفة	KO219-FLL149	BSB FLL D149	Global FLL 149	ABUHAJ FLL149	0	0	0	150
150	اماني محفوظ	KO219-FLL150	BSB FLL D150	Global FLL 150	ABUHAJ FLL150	0	0	0	151
151	محمود خليفة 	KO219-FLL151	BSB FLL D151	Global FLL 151	ABUHAJ FLL151	0	0	0	152
152	صابرين عبدالسلام	KO219-FLL152	BSB FLL D152	Global FLL 152	ABUHAJ FLL152	0	0	0	153
153	ملاك الطاهر	KO219-FLL153	BSB FLL D153	Global FLL 153	ABUHAJ FLL153	0	0	0	154
154	اميرة بن شعبان	KO219-FLL154	BSB FLL D154	Global FLL 154	ABUHAJ FLL154	0	0	0	155
156	محمد الصفراني	KO219-FLL156	BSB FLL D156	Global FLL 156	ABUHAJ FLL156	0	0	0	157
157	وائل احتيوش	KO219-FLL157	BSB FLL D157	Global FLL 157	ABUHAJ FLL157	0	0	0	158
158	محمد فتحي بن اسماعيل	KO219-FLL158	BSB FLL D158	Global FLL 158	ABUHAJ FLL158	0	0	0	159
159	محمد بشون	KO219-FLL159	BSB FLL D159	Global FLL 159	ABUHAJ FLL159	0	0	0	160
160	فيصل العامري	KO219-FLL160	BSB FLL D160	Global FLL 160	ABUHAJ FLL160	0	0	0	161
161	اسراء الورفلي	KO219-FLL161	BSB FLL D161	Global FLL 161	ABUHAJ FLL161	0	0	0	162
162	اسماء الرقيق	KO219-FLL162	BSB FLL D162	Global FLL 162	ABUHAJ FLL162	0	0	0	163
163	مهيمن بن عاشور	KO219-FLL163	BSB FLL D163	Global FLL 163	ABUHAJ FLL163	0	0	0	164
164	جلال احمد 	KO219-FLL164	BSB FLL D164	Global FLL 164	ABUHAJ FLL164	0	0	0	165
165	محمد بن حليم	KO219-FLL165	BSB FLL D165	Global FLL 165	ABUHAJ FLL165	0	0	0	166
166	ضياء ابوزريبة	KO219-FLL166	BSB FLL D166	Global FLL 166	ABUHAJ FLL166	0	0	0	167
167	سندس ادريس عيسى	KO219-FLL167	BSB FLL D167	Global FLL 167	ABUHAJ FLL167	0	0	0	168
168	ادريس العقبي	KO219-FLL168	BSB FLL D168	Global FLL 168	ABUHAJ FLL168	0	0	0	169
155	مشتريات 	KO219-FLL155	BSB FLL D155	Global FLL 155	ABUHAJ FLL155	-351	0	0	156
181	تقوى احمد	KO219-FLL169	BSB FLL D169	Global FLL 169	ABUHAJ FLL169	0	0	0	171
214	مودة محمد	KO219-FLL170	BSB FLL D170	Global FLL 170	ABUHAJ FLL170	0	0	0	212
215	فرح العلام	KO219-FLL171	BSB FLL D171	Global FLL 171	ABUHAJ FLL171	0	0	0	213
218	معتز الصلابي	KO219-FLL174	BSB FLL D174	Global FLL 174	ABUHAJ FLL174	0	0	0	216
219	احمد بلقاسم	KO219-FLL175	BSB FLL D175	Global FLL 175	ABUHAJ FLL175	0	0	0	217
220	سالم الغرياني	KO219-FLL176	BSB FLL D176	Global FLL 176	ABUHAJ FLL176	0	0	0	218
221	فاطمة الزحاف	KO219-FLL177	BSB FLL D177	Global FLL 177	ABUHAJ FLL177	0	0	0	219
222	دعاء دعوش	KO219-FLL178	BSB FLL D178	Global FLL 178	ABUHAJ FLL178	0	0	0	220
224	محمد عامر	KO219-FLL180	BSB FLL D180	Global FLL 180	ABUHAJ FLL180	0	0	0	222
36	عبدالرحيم الزروق	KO219-FLL36	BSB FLL D36	Global FLL 36	ABUHAJ FLL36	-9.200000000000001	0	0	37
217	محمد الرياني 	KO219-FLL173	BSB FLL D173	Global FLL 173	ABUHAJ FLL173	-48	0	0	215
216	سارة الشيباني	KO219-FLL172	BSB FLL D172	Global FLL 172	ABUHAJ FLL172	-60	0	0	214
67	شركة جنة الدنيا 	KO219-FLL67	BSB FLL D67	Global FLL 67	ABUHAJ FLL67	-5925	0	0	68
223	جواد الحميدي	KO219-FLL179	BSB FLL D179	Global FLL 179	ABUHAJ FLL179	-11.8	0	0	221
225	إيلاف المختار	KO219-FLL181	BSB FLL D181	Global FLL 181	ABUHAJ FLL181	0	0	0	223
\.


--
-- Data for Name: Flight; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."Flight" (id, "flightNumber", status, "departureDate", "arrivalDate", country, "createdAt", "updatedAt", type) FROM stdin;
1	الرحلة رقم 1	departed	\N	\N	CHINA	2026-03-04 21:11:57.909	2026-03-05 22:49:28.266	AIR
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."Notification" (id, "userId", title, body, type, read, "firebaseSent", "createdAt", "referenceId") FROM stdin;
1	24	إشعار سحب مالي (طلب جديد)	تم سحب مبلغ 100$ من محفظتك لشراء الطلب "مشدات ظهر + أحذية و حقائب". الرصيد الحالي: -100$	WALLET_UPDATE	f	f	2026-03-04 22:07:49.664	\N
2	24	تم إضافة طلب جديد	تمت إضافة الطلب "مشدات ظهر + أحذية و حقائب" (916835463) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-04 22:07:49.908	1
3	156	تم إضافة طلب جديد	تمت إضافة الطلب "مصباح افالون" (5128142225428) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-04 23:11:40.555	2
4	2	تم إضافة طلب جديد	تمت إضافة الطلب "قطع غيار سيارات" (14739964057) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 19:18:00.456	3
5	221	تم إضافة طلب جديد	تمت إضافة الطلب "اقراص معدنية" (7606253250004) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:30:33.688	4
6	156	إشعار سحب مالي (طلب جديد)	تم سحب مبلغ 1$ من محفظتك لشراء الطلب "ساعة". الرصيد الحالي: -1$	WALLET_UPDATE	f	f	2026-03-05 21:32:48.441	\N
7	156	تم إضافة طلب جديد	تمت إضافة الطلب "ساعة" (8841361572123) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:32:48.449	5
8	156	إشعار سحب مالي (طلب جديد)	تم سحب مبلغ 225$ من محفظتك لشراء الطلب "بروانطي امامي". الرصيد الحالي: -226$	WALLET_UPDATE	f	f	2026-03-05 21:34:18.876	\N
9	156	تم إضافة طلب جديد	تمت إضافة الطلب "بروانطي امامي" (1566330353599) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:34:18.888	6
10	3	تم إضافة طلب جديد	تمت إضافة الطلب "فيتامينات" (800183201493) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:35:01.221	7
11	20	تم إضافة طلب جديد	تمت إضافة الطلب "هاتف" (1566862999929) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:36:10.627	8
12	68	إشعار سحب مالي (طلب جديد)	تم سحب مبلغ 4225$ من محفظتك لشراء الطلب "ادوية". الرصيد الحالي: -4225$	WALLET_UPDATE	f	f	2026-03-05 21:36:52.415	\N
13	68	تم إضافة طلب جديد	تمت إضافة الطلب "ادوية" (15360639236) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:36:52.421	9
14	214	تم إضافة طلب جديد	تمت إضافة الطلب "ملابس" (78979943295318) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:44:05.165	10
15	215	تم إضافة طلب جديد	تمت إضافة الطلب "ملابس" (78979980429550) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:48:16.438	11
16	214	تم إضافة طلب جديد	تمت إضافة الطلب "ملابس" (78980616973935) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:49:21.661	12
17	221	تم إضافة طلب جديد	تمت إضافة الطلب "ملابس" (435061932857498) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:50:57.91	13
18	37	تم إضافة طلب جديد	تمت إضافة الطلب "كيس" (435049828530802) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:53:22.628	14
19	156	تم إضافة طلب جديد	تمت إضافة الطلب "شحن لاسلكي" (435061070276179) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:54:32.835	15
20	37	تم إضافة طلب جديد	تمت إضافة الطلب "معجون اسنان" (78982202434856) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:55:28.894	16
21	214	تم إضافة طلب جديد	تمت إضافة الطلب "كوب" (78981196012124) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 21:59:07.68	17
22	156	تم إضافة طلب جديد	تمت إضافة الطلب "اضواء كامري" (78984456463211) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 22:01:17.551	18
23	156	تم إضافة طلب جديد	تمت إضافة الطلب "علامة مرسيدس" (78581063628506) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 22:02:51.624	19
24	156	إشعار سحب مالي (طلب جديد)	تم سحب مبلغ 1$ من محفظتك لشراء الطلب "ساعة". الرصيد الحالي: -227$	WALLET_UPDATE	f	f	2026-03-05 22:04:06.628	\N
25	156	تم إضافة طلب جديد	تمت إضافة الطلب "ساعة" (435038288596988) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 22:04:06.635	20
26	221	تم إضافة طلب جديد	تمت إضافة الطلب "سيليكون" (7606195695038) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 22:05:43.34	21
27	221	تم إضافة طلب جديد	تمت إضافة الطلب "سيليكون فم" (7606194673527) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 22:06:56.351	22
28	37	تم إضافة طلب جديد	تمت إضافة الطلب "النقاء" (7604930229847) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 22:08:05.898	23
29	221	تم إضافة طلب جديد	تمت إضافة الطلب "قناع" (3154837203488) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 22:09:03.485	24
30	214	تم إضافة طلب جديد	تمت إضافة الطلب "ملابس" (78979903675182) إلى حسابك بنجاح.	NEW_ORDER	f	f	2026-03-05 22:10:09.56	25
31	214	تحديث حالة الطلب	تم تغيير حالة الطلب 78979903675182 إلى وصل إلى الصين	ORDER_UPDATE	f	f	2026-03-05 22:14:03.93	25
32	221	تحديث حالة الطلب	تم تغيير حالة الطلب 3154837203488 إلى وصل إلى الصين	ORDER_UPDATE	f	f	2026-03-05 22:14:17.718	24
33	37	تحديث حالة الطلب	تم تغيير حالة الطلب 7604930229847 إلى وصل إلى الصين	ORDER_UPDATE	f	f	2026-03-05 22:14:27.792	23
34	221	تحديث حالة الطلب	تم تغيير حالة الطلب 7606194673527 إلى وصل إلى الصين	ORDER_UPDATE	f	f	2026-03-05 22:14:39.869	22
35	214	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 12$ من محفظتك كقيمة شحن للطلب "ملابس". الرصيد الحالي: -12$	WALLET_UPDATE	f	f	2026-03-05 22:20:17.533	\N
36	214	تحديث حالة الطلب	تم تغيير حالة الطلب 78979903675182 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:20:17.562	25
37	221	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 2$ من محفظتك كقيمة شحن للطلب "قناع". الرصيد الحالي: -2$	WALLET_UPDATE	f	f	2026-03-05 22:20:58.202	\N
38	221	تحديث حالة الطلب	تم تغيير حالة الطلب 3154837203488 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:20:58.219	24
39	37	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 4.800000000000001$ من محفظتك كقيمة شحن للطلب "النقاء". الرصيد الحالي: -4.800000000000001$	WALLET_UPDATE	f	f	2026-03-05 22:22:31.605	\N
40	37	تحديث حالة الطلب	تم تغيير حالة الطلب 7604930229847 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:22:31.617	23
41	221	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 1.7999999999999998$ من محفظتك كقيمة شحن للطلب "سيليكون فم". الرصيد الحالي: -3.8$	WALLET_UPDATE	f	f	2026-03-05 22:23:00.248	\N
42	221	تحديث حالة الطلب	تم تغيير حالة الطلب 7606194673527 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:23:00.265	22
43	221	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 2$ من محفظتك كقيمة شحن للطلب "سيليكون". الرصيد الحالي: -5.8$	WALLET_UPDATE	f	f	2026-03-05 22:23:28.094	\N
44	221	تحديث حالة الطلب	تم تغيير حالة الطلب 7606195695038 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:23:28.107	21
45	156	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 2$ من محفظتك كقيمة شحن للطلب "ساعة". الرصيد الحالي: -229$	WALLET_UPDATE	f	f	2026-03-05 22:24:39.876	\N
46	156	تحديث حالة الطلب	تم تغيير حالة الطلب 435038288596988 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:24:39.891	20
47	156	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 2$ من محفظتك كقيمة شحن للطلب "علامة مرسيدس". الرصيد الحالي: -231$	WALLET_UPDATE	f	f	2026-03-05 22:25:31.967	\N
48	156	تحديث حالة الطلب	تم تغيير حالة الطلب 78581063628506 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:25:31.985	19
49	156	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 2$ من محفظتك كقيمة شحن للطلب "اضواء كامري". الرصيد الحالي: -233$	WALLET_UPDATE	f	f	2026-03-05 22:26:04.796	\N
50	156	تحديث حالة الطلب	تم تغيير حالة الطلب 78984456463211 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:26:04.814	18
51	214	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 12$ من محفظتك كقيمة شحن للطلب "كوب". الرصيد الحالي: -24$	WALLET_UPDATE	f	f	2026-03-05 22:26:28.832	\N
52	214	تحديث حالة الطلب	تم تغيير حالة الطلب 78981196012124 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:26:28.854	17
53	37	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 2.4000000000000004$ من محفظتك كقيمة شحن للطلب "معجون اسنان". الرصيد الحالي: -7.200000000000001$	WALLET_UPDATE	f	f	2026-03-05 22:26:59.323	\N
54	37	تحديث حالة الطلب	تم تغيير حالة الطلب 78982202434856 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:26:59.338	16
55	156	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 4$ من محفظتك كقيمة شحن للطلب "شحن لاسلكي". الرصيد الحالي: -237$	WALLET_UPDATE	f	f	2026-03-05 22:28:27.071	\N
56	156	تحديث حالة الطلب	تم تغيير حالة الطلب 435061070276179 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:28:27.089	15
57	37	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 2$ من محفظتك كقيمة شحن للطلب "كيس". الرصيد الحالي: -9.200000000000001$	WALLET_UPDATE	f	f	2026-03-05 22:29:45.97	\N
58	37	تحديث حالة الطلب	تم تغيير حالة الطلب 435049828530802 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:29:45.984	14
59	221	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 4$ من محفظتك كقيمة شحن للطلب "ملابس". الرصيد الحالي: -9.8$	WALLET_UPDATE	f	f	2026-03-05 22:42:32.335	\N
60	221	تحديث حالة الطلب	تم تغيير حالة الطلب 435061932857498 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:42:32.347	13
61	214	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 26$ من محفظتك كقيمة شحن للطلب "ملابس". الرصيد الحالي: -50$	WALLET_UPDATE	f	f	2026-03-05 22:43:02.893	\N
62	214	تحديث حالة الطلب	تم تغيير حالة الطلب 78980616973935 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:43:02.911	12
63	215	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 48$ من محفظتك كقيمة شحن للطلب "ملابس". الرصيد الحالي: -48$	WALLET_UPDATE	f	f	2026-03-05 22:43:35.532	\N
64	215	تحديث حالة الطلب	تم تغيير حالة الطلب 78979980429550 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:43:35.545	11
65	214	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 10$ من محفظتك كقيمة شحن للطلب "ملابس". الرصيد الحالي: -60$	WALLET_UPDATE	f	f	2026-03-05 22:44:07.416	\N
66	214	تحديث حالة الطلب	تم تغيير حالة الطلب 78979943295318 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:44:07.428	10
67	68	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 1700$ من محفظتك كقيمة شحن للطلب "ادوية". الرصيد الحالي: -5925$	WALLET_UPDATE	f	f	2026-03-05 22:44:51.976	\N
68	68	تحديث حالة الطلب	تم تغيير حالة الطلب 15360639236 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:44:51.989	9
69	20	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 15$ من محفظتك كقيمة شحن للطلب "هاتف". الرصيد الحالي: -15$	WALLET_UPDATE	f	f	2026-03-05 22:45:19.603	\N
70	20	تحديث حالة الطلب	تم تغيير حالة الطلب 1566862999929 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:45:19.619	8
71	3	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 1012$ من محفظتك كقيمة شحن للطلب "فيتامينات". الرصيد الحالي: -1012$	WALLET_UPDATE	f	f	2026-03-05 22:45:50.451	\N
72	3	تحديث حالة الطلب	تم تغيير حالة الطلب 800183201493 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:45:50.463	7
73	156	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 80$ من محفظتك كقيمة شحن للطلب "بروانطي امامي". الرصيد الحالي: -317$	WALLET_UPDATE	f	f	2026-03-05 22:46:19.945	\N
74	156	تحديث حالة الطلب	تم تغيير حالة الطلب 1566330353599 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:46:19.965	6
75	156	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 2$ من محفظتك كقيمة شحن للطلب "ساعة". الرصيد الحالي: -319$	WALLET_UPDATE	f	f	2026-03-05 22:47:15.986	\N
76	156	تحديث حالة الطلب	تم تغيير حالة الطلب 8841361572123 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:47:16.003	5
77	221	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 2$ من محفظتك كقيمة شحن للطلب "اقراص معدنية". الرصيد الحالي: -11.8$	WALLET_UPDATE	f	f	2026-03-05 22:47:58.624	\N
78	221	تحديث حالة الطلب	تم تغيير حالة الطلب 7606253250004 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:47:58.643	4
79	156	إشعار سحب مالي (شحن طلب)	تم سحب مبلغ 32$ من محفظتك كقيمة شحن للطلب "مصباح افالون". الرصيد الحالي: -351$	WALLET_UPDATE	f	f	2026-03-05 22:48:53.361	\N
80	156	تحديث حالة الطلب	تم تغيير حالة الطلب 5128142225428 إلى قيد الشحن لليبيا	ORDER_UPDATE	f	f	2026-03-05 22:48:53.378	2
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."Order" (id, "trackingNumber", name, "usdPrice", "cnyPrice", "productUrl", notes, status, weight, "customerId", "createdAt", "updatedAt", "shippingRateId", "shippingCost", "shippingRateName", "shippingRatePrice", country, "flightNumber", "flightId") FROM stdin;
1	916835463	مشدات ظهر + أحذية و حقائب	100	\N	https://qr.1688.com/s/BpLV9Oqa CZ6272	لم يتم الشحن الداخلي بعد حتى يتم انشاء رقم نتبع .\n- ثم استلام القيمة بالدينار الليبي	purchased	\N	23	2026-03-04 22:07:49.376	2026-03-04 22:07:49.376	\N	\N	\N	\N	CHINA	\N	1
3	14739964057	قطع غيار سيارات	0	\N	\N	\N	purchased	\N	1	2026-03-05 19:18:00.445	2026-03-05 19:18:00.445	\N	\N	\N	\N	CHINA	\N	\N
5	8841361572123	ساعة	1	\N	\N	\N	shipping_to_libya	0.2	155	2026-03-05 21:32:48.413	2026-03-05 22:47:15.991	41	2	بضائع عادية	10	CHINA	\N	1
4	7606253250004	اقراص معدنية	0	\N	\N	\N	shipping_to_libya	0.2	223	2026-03-05 21:30:33.677	2026-03-05 22:47:58.634	41	2	بضائع عادية	10	CHINA	\N	1
2	5128142225428	مصباح افالون	0	\N	\N	\N	shipping_to_libya	3.2	155	2026-03-04 23:11:40.522	2026-03-05 22:48:53.368	41	32	بضائع عادية	10	CHINA	\N	1
25	78979903675182	ملابس	0	\N	\N	\N	shipping_to_libya	1.2	216	2026-03-05 22:10:09.55	2026-03-05 22:20:17.553	41	12	بضائع عادية	10	CHINA	\N	1
24	3154837203488	قناع	0	\N	\N	\N	shipping_to_libya	0.2	223	2026-03-05 22:09:03.476	2026-03-05 22:20:58.21	41	2	بضائع عادية	10	CHINA	\N	1
23	7604930229847	النقاء	0	\N	\N	\N	shipping_to_libya	0.4	36	2026-03-05 22:08:05.886	2026-03-05 22:22:31.608	42	4.800000000000001	تجميل	12	CHINA	\N	1
22	7606194673527	سيليكون فم	0	\N	\N	\N	shipping_to_libya	0.18	223	2026-03-05 22:06:56.344	2026-03-05 22:23:00.256	41	1.8	بضائع عادية	10	CHINA	\N	1
21	7606195695038	سيليكون	0	\N	\N	\N	shipping_to_libya	0.2	223	2026-03-05 22:05:43.328	2026-03-05 22:23:28.098	41	2	بضائع عادية	10	CHINA	\N	1
20	435038288596988	ساعة	1	\N	\N	\N	shipping_to_libya	0.2	155	2026-03-05 22:04:06.616	2026-03-05 22:24:39.882	41	2	بضائع عادية	10	CHINA	\N	1
19	78581063628506	علامة مرسيدس	0	\N	\N	\N	shipping_to_libya	0.2	155	2026-03-05 22:02:51.613	2026-03-05 22:25:31.973	41	2	بضائع عادية	10	CHINA	\N	1
18	78984456463211	اضواء كامري	0	\N	\N	\N	shipping_to_libya	0.2	155	2026-03-05 22:01:17.541	2026-03-05 22:26:04.802	41	2	بضائع عادية	10	CHINA	\N	1
17	78981196012124	كوب	0	\N	\N	\N	shipping_to_libya	1.2	216	2026-03-05 21:59:07.671	2026-03-05 22:26:28.841	41	12	بضائع عادية	10	CHINA	\N	1
16	78982202434856	معجون اسنان	0	\N	\N	\N	shipping_to_libya	0.2	36	2026-03-05 21:55:28.884	2026-03-05 22:26:59.329	42	2.4	تجميل	12	CHINA	\N	1
15	435061070276179	شحن لاسلكي	0	\N	\N	\N	shipping_to_libya	0.4	155	2026-03-05 21:54:32.822	2026-03-05 22:28:27.078	41	4	بضائع عادية	10	CHINA	\N	1
14	435049828530802	كيس	0	\N	\N	\N	shipping_to_libya	0.2	36	2026-03-05 21:53:22.617	2026-03-05 22:29:45.974	41	2	بضائع عادية	10	CHINA	\N	1
13	435061932857498	ملابس	0	\N	\N	\N	shipping_to_libya	0.4	223	2026-03-05 21:50:57.901	2026-03-05 22:42:32.339	41	4	بضائع عادية	10	CHINA	\N	1
12	78980616973935	ملابس	0	\N	\N	\N	shipping_to_libya	2.6	216	2026-03-05 21:49:21.652	2026-03-05 22:43:02.899	41	26	بضائع عادية	10	CHINA	\N	1
11	78979980429550	ملابس	0	\N	\N	\N	shipping_to_libya	4.8	217	2026-03-05 21:48:16.423	2026-03-05 22:43:35.538	41	48	بضائع عادية	10	CHINA	\N	1
10	78979943295318	ملابس	0	\N	\N	\N	shipping_to_libya	1	216	2026-03-05 21:44:05.154	2026-03-05 22:44:07.421	41	10	بضائع عادية	10	CHINA	\N	1
9	15360639236	ادوية	4225	\N	\N	\N	shipping_to_libya	68	67	2026-03-05 21:36:52.397	2026-03-05 22:44:51.981	46	1700	أدوية	25	CHINA	\N	1
8	1566862999929	هاتف	0	\N	\N	\N	shipping_to_libya	1.5	19	2026-03-05 21:36:10.616	2026-03-05 22:45:19.61	41	15	بضائع عادية	10	CHINA	\N	1
7	800183201493	فيتامينات	0	\N	\N	\N	shipping_to_libya	46	2	2026-03-05 21:35:01.213	2026-03-05 22:45:50.455	45	1012	حبوب فيتامينات 	22	CHINA	\N	1
6	1566330353599	بروانطي امامي	225	\N	\N	\N	shipping_to_libya	8	155	2026-03-05 21:34:18.861	2026-03-05 22:46:19.954	41	80	بضائع عادية	10	CHINA	\N	1
\.


--
-- Data for Name: OrderLog; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."OrderLog" (id, "orderId", status, note, "createdAt") FROM stdin;
1	1	purchased	\N	2026-03-04 22:07:49.376
2	2	purchased	\N	2026-03-04 23:11:40.522
3	3	purchased	\N	2026-03-05 19:18:00.445
4	4	purchased	\N	2026-03-05 21:30:33.677
5	5	purchased	\N	2026-03-05 21:32:48.413
6	6	purchased	\N	2026-03-05 21:34:18.861
7	7	purchased	\N	2026-03-05 21:35:01.213
8	8	purchased	\N	2026-03-05 21:36:10.616
9	9	purchased	\N	2026-03-05 21:36:52.397
10	10	purchased	\N	2026-03-05 21:44:05.154
11	11	purchased	\N	2026-03-05 21:48:16.423
12	12	purchased	\N	2026-03-05 21:49:21.652
13	13	purchased	\N	2026-03-05 21:50:57.901
14	14	purchased	\N	2026-03-05 21:53:22.617
15	15	purchased	\N	2026-03-05 21:54:32.822
16	16	purchased	\N	2026-03-05 21:55:28.884
17	17	purchased	\N	2026-03-05 21:59:07.671
18	18	purchased	\N	2026-03-05 22:01:17.541
19	19	purchased	\N	2026-03-05 22:02:51.613
20	20	purchased	\N	2026-03-05 22:04:06.616
21	21	purchased	\N	2026-03-05 22:05:43.328
22	22	purchased	\N	2026-03-05 22:06:56.344
23	23	purchased	\N	2026-03-05 22:08:05.886
24	24	purchased	\N	2026-03-05 22:09:03.476
25	25	purchased	\N	2026-03-05 22:10:09.55
26	25	arrived_to_china	\N	2026-03-05 22:14:03.903
27	24	arrived_to_china	\N	2026-03-05 22:14:17.712
28	23	arrived_to_china	\N	2026-03-05 22:14:27.782
29	22	arrived_to_china	\N	2026-03-05 22:14:39.851
30	25	shipping_to_libya	\N	2026-03-05 22:20:17.553
31	24	shipping_to_libya	\N	2026-03-05 22:20:58.21
32	23	shipping_to_libya	\N	2026-03-05 22:22:31.608
33	22	shipping_to_libya	\N	2026-03-05 22:23:00.256
34	21	shipping_to_libya	\N	2026-03-05 22:23:28.098
35	20	shipping_to_libya	\N	2026-03-05 22:24:39.882
36	19	shipping_to_libya	\N	2026-03-05 22:25:31.973
37	18	shipping_to_libya	\N	2026-03-05 22:26:04.802
38	17	shipping_to_libya	\N	2026-03-05 22:26:28.841
39	16	shipping_to_libya	\N	2026-03-05 22:26:59.329
40	15	shipping_to_libya	\N	2026-03-05 22:28:27.078
41	14	shipping_to_libya	\N	2026-03-05 22:29:45.974
42	13	shipping_to_libya	\N	2026-03-05 22:42:32.339
43	12	shipping_to_libya	\N	2026-03-05 22:43:02.899
44	11	shipping_to_libya	\N	2026-03-05 22:43:35.538
45	10	shipping_to_libya	\N	2026-03-05 22:44:07.421
46	9	shipping_to_libya	\N	2026-03-05 22:44:51.981
47	8	shipping_to_libya	\N	2026-03-05 22:45:19.61
48	7	shipping_to_libya	\N	2026-03-05 22:45:50.455
49	6	shipping_to_libya	\N	2026-03-05 22:46:19.954
50	5	shipping_to_libya	\N	2026-03-05 22:47:15.991
51	4	shipping_to_libya	\N	2026-03-05 22:47:58.634
52	2	shipping_to_libya	\N	2026-03-05 22:48:53.368
\.


--
-- Data for Name: OrderMessage; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."OrderMessage" (id, "orderId", "authorId", content, "imageUrl", "readBy", "createdAt", "replyToId") FROM stdin;
\.


--
-- Data for Name: PasswordResetCode; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."PasswordResetCode" (id, email, code, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: PendingRegistration; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."PendingRegistration" (id, name, email, "passwordHash", mobile, otp, "expiresAt", "createdAt", "fcmToken", location) FROM stdin;
\.


--
-- Data for Name: SettingsChangeLog; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."SettingsChangeLog" (id, "settingKey", "changedById", "changedByName", note, "diffSummary", snapshot, "createdAt") FROM stdin;
1	privacy_policy	1	مدير النظام	\N	تمت إضافة 4 بنداً	[{"title":"٥. التحديثات والتعديلات","body":"قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم نشر التغييرات على هذه الصفحة مع إشعار مسبق في حال وجود تغييرات جوهرية."},{"title":"صثب","body":"صثب"},{"title":"ثصب","body":"صثب"},{"title":"ثصب","body":"صثب"},{"title":"ثصب","body":"ثبص"}]	2026-03-04 20:03:22.499
\.


--
-- Data for Name: Shipment; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."Shipment" (id, "shipmentId", weight, "fromWarehouseId", "toWarehouseId", status) FROM stdin;
\.


--
-- Data for Name: ShipmentItem; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."ShipmentItem" (id, "shipmentId", "orderId") FROM stdin;
\.


--
-- Data for Name: ShippingRate; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."ShippingRate" (id, type, name, price, "createdAt", "updatedAt", country) FROM stdin;
41	AIR	بضائع عادية	10	2026-03-05 22:15:31.303	2026-03-05 22:15:31.303	CHINA
42	AIR	تجميل	12	2026-03-05 22:16:01.432	2026-03-05 22:16:01.432	CHINA
43	AIR	مقلد	13	2026-03-05 22:16:19.463	2026-03-05 22:16:19.463	CHINA
44	AIR	عطور	13	2026-03-05 22:16:29.499	2026-03-05 22:16:29.499	CHINA
45	AIR	حبوب فيتامينات 	22	2026-03-05 22:17:07.472	2026-03-05 22:17:07.472	CHINA
46	AIR	أدوية	25	2026-03-05 22:17:19.063	2026-03-05 22:17:19.063	CHINA
47	AIR	اللاسلكي و أجهزة الكشف عن الذهب	22	2026-03-05 22:17:49.261	2026-03-05 22:17:49.261	CHINA
48	AIR	أجهزة التعدين	30	2026-03-05 22:18:08.466	2026-03-05 22:18:08.466	CHINA
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."SiteSettings" (key, value, "updatedAt") FROM stdin;
privacy_policy	[{"title":"٥. التحديثات والتعديلات","body":"قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم نشر التغييرات على هذه الصفحة مع إشعار مسبق في حال وجود تغييرات جوهرية."},{"title":"صثب","body":"صثب"},{"title":"ثصب","body":"صثب"},{"title":"ثصب","body":"صثب"},{"title":"ثصب","body":"ثبص"}]	2026-03-04 20:03:22.49
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."Transaction" (id, "customerId", type, amount, currency, "balanceBefore", "balanceAfter", notes, "createdBy", "createdAt") FROM stdin;
1	23	WITHDRAWAL	100	USD	0	-100	خصم سعر الطلب - مشدات ظهر + أحذية و حقائب (#916835463)	1	2026-03-04 22:07:49.614
2	155	WITHDRAWAL	1	USD	0	-1	خصم سعر الطلب - ساعة (#8841361572123)	1	2026-03-05 21:32:48.43
3	155	WITHDRAWAL	225	USD	-1	-226	خصم سعر الطلب - بروانطي امامي (#1566330353599)	1	2026-03-05 21:34:18.873
4	67	WITHDRAWAL	4225	USD	0	-4225	خصم سعر الطلب - ادوية (#15360639236)	1	2026-03-05 21:36:52.408
5	155	WITHDRAWAL	1	USD	-226	-227	خصم سعر الطلب - ساعة (#435038288596988)	1	2026-03-05 22:04:06.623
6	216	WITHDRAWAL	12	USD	0	-12	خصم سعر الشحن - ملابس (#78979903675182)	1	2026-03-05 22:20:17.529
7	223	WITHDRAWAL	2	USD	0	-2	خصم سعر الشحن - قناع (#3154837203488)	1	2026-03-05 22:20:58.198
8	36	WITHDRAWAL	4.800000000000001	USD	0	-4.800000000000001	خصم سعر الشحن - النقاء (#7604930229847)	1	2026-03-05 22:22:31.599
9	223	WITHDRAWAL	1.8	USD	-2	-3.8	خصم سعر الشحن - سيليكون فم (#7606194673527)	1	2026-03-05 22:23:00.245
10	223	WITHDRAWAL	2	USD	-3.8	-5.8	خصم سعر الشحن - سيليكون (#7606195695038)	1	2026-03-05 22:23:28.088
11	155	WITHDRAWAL	2	USD	-227	-229	خصم سعر الشحن - ساعة (#435038288596988)	1	2026-03-05 22:24:39.869
12	155	WITHDRAWAL	2	USD	-229	-231	خصم سعر الشحن - علامة مرسيدس (#78581063628506)	1	2026-03-05 22:25:31.96
13	155	WITHDRAWAL	2	USD	-231	-233	خصم سعر الشحن - اضواء كامري (#78984456463211)	1	2026-03-05 22:26:04.79
14	216	WITHDRAWAL	12	USD	-12	-24	خصم سعر الشحن - كوب (#78981196012124)	1	2026-03-05 22:26:28.824
15	36	WITHDRAWAL	2.4	USD	-4.800000000000001	-7.200000000000001	خصم سعر الشحن - معجون اسنان (#78982202434856)	1	2026-03-05 22:26:59.315
16	155	WITHDRAWAL	4	USD	-233	-237	خصم سعر الشحن - شحن لاسلكي (#435061070276179)	1	2026-03-05 22:28:27.067
17	36	WITHDRAWAL	2	USD	-7.200000000000001	-9.200000000000001	خصم سعر الشحن - كيس (#435049828530802)	1	2026-03-05 22:29:45.967
18	223	WITHDRAWAL	4	USD	-5.8	-9.8	خصم سعر الشحن - ملابس (#435061932857498)	1	2026-03-05 22:42:32.331
19	216	WITHDRAWAL	26	USD	-24	-50	خصم سعر الشحن - ملابس (#78980616973935)	1	2026-03-05 22:43:02.887
20	217	WITHDRAWAL	48	USD	0	-48	خصم سعر الشحن - ملابس (#78979980429550)	1	2026-03-05 22:43:35.528
21	216	WITHDRAWAL	10	USD	-50	-60	خصم سعر الشحن - ملابس (#78979943295318)	1	2026-03-05 22:44:07.412
22	67	WITHDRAWAL	1700	USD	-4225	-5925	خصم سعر الشحن - ادوية (#15360639236)	1	2026-03-05 22:44:51.97
23	19	WITHDRAWAL	15	USD	0	-15	خصم سعر الشحن - هاتف (#1566862999929)	1	2026-03-05 22:45:19.6
24	2	WITHDRAWAL	1012	USD	0	-1012	خصم سعر الشحن - فيتامينات (#800183201493)	1	2026-03-05 22:45:50.447
25	155	WITHDRAWAL	80	USD	-237	-317	خصم سعر الشحن - بروانطي امامي (#1566330353599)	1	2026-03-05 22:46:19.926
26	155	WITHDRAWAL	2	USD	-317	-319	خصم سعر الشحن - ساعة (#8841361572123)	1	2026-03-05 22:47:15.981
27	223	WITHDRAWAL	2	USD	-9.8	-11.8	خصم سعر الشحن - اقراص معدنية (#7606253250004)	1	2026-03-05 22:47:58.62
28	155	WITHDRAWAL	32	USD	-319	-351	خصم سعر الشحن - مصباح افالون (#5128142225428)	1	2026-03-05 22:48:53.355
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."User" (id, name, email, "passwordHash", role, "customerId", "tokenVersion", mobile, "photoUrl", "passportUrl", suspended, approved, "createdAt", "fcmTokens", location) FROM stdin;
2	محمد شراطة	\N	913460616	CUSTOMER	\N	0	913460616	\N	\N	f	t	2026-03-04 19:38:51.78	{}	جنزور
3	مهاب الحامدي	\N	918557797	CUSTOMER	\N	0	918557797	\N	\N	f	t	2026-03-04 19:38:51.795	{}	الدريبي
4	محمد ابوقحص	\N	918395387	CUSTOMER	\N	0	918395387	\N	\N	f	t	2026-03-04 19:38:51.803	{}	غدامس
6	فايز دعباج	\N	944774191	CUSTOMER	\N	0	944774191	\N	\N	f	t	2026-03-04 19:38:51.819	{}	الخمس
7	عبدو الدرناوي	\N	921628291	CUSTOMER	\N	0	921628291	\N	\N	f	t	2026-03-04 19:38:51.829	{}	المشتل
8	احمد القنباوي	\N	911184010	CUSTOMER	\N	0	911184010	\N	\N	f	t	2026-03-04 19:38:51.842	{}	الزاوية
9	ابتهاج حمد	\N	924640262	CUSTOMER	\N	0	924640262	\N	\N	f	t	2026-03-04 19:38:51.846	{}	طبرق
10	ريان ابوزنقرة	\N	919291636	CUSTOMER	\N	0	919291636	\N	\N	f	t	2026-03-04 19:38:51.857	{}	الخمس
11	علي العنكفي	\N	922334041	CUSTOMER	\N	0	922334041	\N	\N	f	t	2026-03-04 19:38:51.862	{}	الخمس
12	عبدالحميد النقاصة	\N	944257877	CUSTOMER	\N	0	944257877	\N	\N	f	t	2026-03-04 19:38:51.873	{}	جنزور
13	ناصر عبدالكريم	\N	925131665	CUSTOMER	\N	0	925131665	\N	\N	f	t	2026-03-04 19:38:51.88	{}	قصر بن غشير
14	بشرى عامر	\N	945895429	CUSTOMER	\N	0	945895429	\N	\N	f	t	2026-03-04 19:38:51.887	{}	الزاوية
15	مسعود عبدالكريم	\N	921414462	CUSTOMER	\N	0	921414462	\N	\N	f	t	2026-03-04 19:38:51.895	{}	براك الشاطئ
16	عدي المصراتي	\N	945372034	CUSTOMER	\N	0	945372034	\N	\N	f	t	2026-03-04 19:38:51.902	{}	ابوستة
17	وليد بن فايد	\N	924753732	CUSTOMER	\N	0	924753732	\N	\N	f	t	2026-03-04 19:38:51.912	{}	طرابلس
18	أحمد الجبالي	\N	926285190	CUSTOMER	\N	0	926285190	\N	\N	f	t	2026-03-04 19:38:51.924	{}	عين زارة
19	محمود سريول	\N	946339558	CUSTOMER	\N	0	946339558	\N	\N	f	t	2026-03-04 19:38:51.931	{}	سوق الجمعة
20	عبدالمالك عثمان	\N	914250586	CUSTOMER	\N	0	914250586	\N	\N	f	t	2026-03-04 19:38:51.94	{}	زاوية
21	أمينة علي	\N	911155613	CUSTOMER	\N	0	911155613	\N	\N	f	t	2026-03-04 19:38:51.946	{}	زاوية
22	محمد عبدالله	\N	931888858	CUSTOMER	\N	0	931888858	\N	\N	f	t	2026-03-04 19:38:51.954	{}	حي الاندلس
23	صالح اعظيم	\N	918605630	CUSTOMER	\N	0	918605630	\N	\N	f	t	2026-03-04 19:38:51.961	{}	الدريبي
24	احمد اغا	\N	916835463	CUSTOMER	\N	0	916835463	\N	\N	f	t	2026-03-04 19:38:51.964	{}	سوق الجمعة
25	صيري الزاوية	\N	947162009	CUSTOMER	\N	0	947162009	\N	\N	f	t	2026-03-04 19:38:51.974	{}	جنزور
26	نجلاء الفيتوري	\N	942805479	CUSTOMER	\N	0	942805479	\N	\N	f	t	2026-03-04 19:38:51.978	{}	المرج
27	محمد ناجي	\N	921999889	CUSTOMER	\N	0	921999889	\N	\N	f	t	2026-03-04 19:38:51.987	{}	طرابلس
28	انسام	\N	926911966	CUSTOMER	\N	0	926911966	\N	\N	f	t	2026-03-04 19:38:51.992	{}	سوق الجمعة
29	ابوبكر الشهوبي	\N	918534006	CUSTOMER	\N	0	918534006	\N	\N	f	t	2026-03-04 19:38:51.999	{}	بنغازي
30	عائشة عون	\N	924155142	CUSTOMER	\N	0	924155142	\N	\N	f	t	2026-03-04 19:38:52.005	{}	صبراتة
31	محمد العمراني	\N	927113604	CUSTOMER	\N	0	927113604	\N	\N	f	t	2026-03-04 19:38:52.013	{}	السياحية
32	رائد ديره	\N	919900955	CUSTOMER	\N	0	919900955	\N	\N	f	t	2026-03-04 19:38:52.022	{}	الدعوة الاسلامية
33	محمد الزليطني	\N	930676267	CUSTOMER	\N	0	930676267	\N	\N	f	t	2026-03-04 19:38:52.028	{}	قصر بن غشير
34	سعد جمعة	\N	928383765	CUSTOMER	\N	0	928383765	\N	\N	f	t	2026-03-04 19:38:52.036	{}	المرج
35	علي كريم	\N	925464920	CUSTOMER	\N	0	925464920	\N	\N	f	t	2026-03-04 19:38:52.044	{}	الزاوية
36	اينور خالد	\N	945428969	CUSTOMER	\N	0	945428969	\N	\N	f	t	2026-03-04 19:38:52.052	{}	بنغازي
37	عبدالرحيم الزروق	\N	918664659	CUSTOMER	\N	0	918664659	\N	\N	f	t	2026-03-04 19:38:52.056	{}	شارع السيدي
38	عزو بومكاتيب	\N	928381824	CUSTOMER	\N	0	928381824	\N	\N	f	t	2026-03-04 19:38:52.067	{}	بنغازي
39	وسيم البوزيدي	\N	913092928	CUSTOMER	\N	0	913092928	\N	\N	f	t	2026-03-04 19:38:52.07	{}	جنزور
40	محمد البزن	\N	924546887	CUSTOMER	\N	0	924546887	\N	\N	f	t	2026-03-04 19:38:52.081	{}	بوهريدة
41	متجر اليقين	\N	913521866	CUSTOMER	\N	0	913521866	\N	\N	f	t	2026-03-04 19:38:52.084	{}	الخمس
1	مدير النظام	admin@fll.ly	Fll@Adm!n#2026$Xz	ADMIN	\N	0	٠٩١٥٦٨٤٠٠٦	/uploads/1772653436013-915604735-Component-1.png		f	t	2026-02-17 22:30:34.787	{}	\N
42	معاذ الاطرش	\N	0928971538	CUSTOMER	\N	0	0928971538			f	t	2026-03-04 19:56:16.521	{}	\N
43	احمد المجعوك	\N	0910919412	CUSTOMER	\N	0	0910919412			f	t	2026-03-04 19:58:01.608	{}	\N
44	احمد النامي	\N	0911750941	CUSTOMER	\N	0	0911750941			f	t	2026-03-04 20:00:00.144	{}	\N
45	احمد اشكال	\N	0927249383	CUSTOMER	\N	0	0927249383			f	t	2026-03-04 20:01:18.28	{}	\N
46	احمد مريغان	\N	0921478942	CUSTOMER	\N	0	0921478942			f	t	2026-03-04 20:02:02.523	{}	\N
51	عامر عون	\N	0926676653	CUSTOMER	\N	0	0926676653			f	t	2026-03-04 20:07:28.383	{}	\N
47	ندى سهواكة	\N	0920469203	CUSTOMER	\N	0	0920469203			f	t	2026-03-04 20:03:01.081	{}	\N
48	احمد المزوغي	\N	0910660065	CUSTOMER	\N	0	0910660065			f	t	2026-03-04 20:03:57.89	{}	\N
49	احمد عيد 	\N	0920202229	CUSTOMER	\N	0	0920202229			f	t	2026-03-04 20:06:01.083	{}	\N
50	معتز العوراني	\N	0915555344	CUSTOMER	\N	0	0915555344			f	t	2026-03-04 20:06:54.232	{}	\N
52	مسعودة الزين	\N	0916804348	CUSTOMER	\N	0	0916804348			f	t	2026-03-04 20:08:27.287	{}	\N
53	عبدالرحمن الطبال	\N	0944572190	CUSTOMER	\N	0	0944572190			f	t	2026-03-04 20:09:23.249	{}	\N
54	محمد الغرياني	\N	+60 11-2846 3095⁩	CUSTOMER	\N	0	+60 11-2846 3095⁩			f	t	2026-03-04 20:16:28.769	{}	\N
55	احمد الذيب	\N	099999999999	CUSTOMER	\N	0	099999999999			f	t	2026-03-04 20:28:39.164	{}	\N
56	تجارب فواتير	\N	09233322112	CUSTOMER	\N	0	09233322112			f	t	2026-03-04 20:29:04.123	{}	\N
57	احمد برباش	\N	0926465037	CUSTOMER	\N	0	0926465037			f	t	2026-03-04 20:29:59.933	{}	\N
58	فيصل المجبري	\N	0928976386	CUSTOMER	\N	0	0928976386			f	t	2026-03-04 20:30:36.703	{}	\N
59	تاج زيدان	\N	0931349116	CUSTOMER	\N	0	0931349116			f	t	2026-03-04 20:31:04.62	{}	\N
60	محمد الشريف	\N	0942675231	CUSTOMER	\N	0	0942675231			f	t	2026-03-04 20:34:38.049	{}	\N
61	ابرار 	\N	0943886538	CUSTOMER	\N	0	0943886538			f	t	2026-03-04 20:37:12.37	{}	\N
62	احلام يزيد	\N	0915070774	CUSTOMER	\N	0	0915070774			f	t	2026-03-04 20:37:46.144	{}	\N
63	احمد الزاوي	\N	0912345000	CUSTOMER	\N	0	0912345000			f	t	2026-03-04 20:41:51.448	{}	\N
64	واثق ميلاد	\N	0918694861	CUSTOMER	\N	0	0918694861			f	t	2026-03-04 20:42:42.306	{}	\N
65	مهند بالحاج	\N	0915868612	CUSTOMER	\N	0	0915868612			f	t	2026-03-04 20:43:31.883	{}	\N
66	حمزة الفرع	\N	0917294610	CUSTOMER	\N	0	0917294610			f	t	2026-03-04 20:44:24.147	{}	\N
67	ربيع موسى	\N	0928842270	CUSTOMER	\N	0	0928842270			f	t	2026-03-04 20:45:00.954	{}	\N
68	شركة جنة الدنيا 	\N	0912232309	CUSTOMER	\N	0	0912232309			f	t	2026-03-04 20:45:50.423	{}	\N
69	انس عبدالغني	\N	0926024731	CUSTOMER	\N	0	0926024731			f	t	2026-03-04 20:46:22.671	{}	\N
70	مفتاح اشقيفة	\N	0927612832	CUSTOMER	\N	0	0927612832			f	t	2026-03-04 20:46:48.415	{}	\N
71	نورا احمد 	\N	0943014896	CUSTOMER	\N	0	0943014896			f	t	2026-03-04 20:47:17.095	{}	\N
72	مرام نوير	\N	0915325619	CUSTOMER	\N	0	0915325619			f	t	2026-03-04 20:47:47.294	{}	\N
73	فاطمة الشريف	\N	0927642476	CUSTOMER	\N	0	0927642476			f	t	2026-03-04 20:48:12.815	{}	\N
74	شاهين حكومة	\N	0934268485	CUSTOMER	\N	0	0934268485			f	t	2026-03-04 20:49:36.911	{}	\N
75	احمد اشتيوي	\N	0918299604	CUSTOMER	\N	0	0918299604			f	t	2026-03-04 20:50:12.808	{}	\N
76	معتصم	\N	0945380919	CUSTOMER	\N	0	0945380919			f	t	2026-03-04 20:50:43.412	{}	\N
77	اماني عمر	\N	0919699849	CUSTOMER	\N	0	0919699849			f	t	2026-03-04 20:51:19.815	{}	\N
78	اريج علي	\N	0910112028	CUSTOMER	\N	0	0910112028			f	t	2026-03-04 20:51:48.607	{}	\N
79	يونس بالقاسم	\N	0944301190	CUSTOMER	\N	0	0944301190			f	t	2026-03-04 20:52:27.208	{}	\N
80	فداء بنيني	\N	0926562113	CUSTOMER	\N	0	0926562113			f	t	2026-03-04 20:52:52.914	{}	\N
81	تميم عبدالمجيد لياس	\N	0918690189	CUSTOMER	\N	0	0918690189			f	t	2026-03-04 20:53:26.358	{}	\N
82	خلود الجفرة	\N	0910845760	CUSTOMER	\N	0	0910845760			f	t	2026-03-04 20:54:07.175	{}	\N
83	ريم حناينية	\N	+21629092760	CUSTOMER	\N	0	+21629092760			f	t	2026-03-04 20:54:46.383	{}	\N
84	اسامة البريكي	\N	0916846308	CUSTOMER	\N	0	0916846308			f	t	2026-03-04 20:55:59.131	{}	\N
85	محمد بودقاقة	\N	0922791602	CUSTOMER	\N	0	0922791602			f	t	2026-03-04 20:56:59.311	{}	\N
86	مالك مفتاح	\N	+4917632548518	CUSTOMER	\N	0	+4917632548518			f	t	2026-03-04 20:58:03.555	{}	\N
87	سامر الادريس	\N	0912505404	CUSTOMER	\N	0	0912505404			f	t	2026-03-04 20:58:43.181	{}	\N
88	ديانا نوار	\N	+201013458322	CUSTOMER	\N	0	+201013458322			f	t	2026-03-04 20:59:34.046	{}	\N
89	ام كلثوم 	\N	0942679771	CUSTOMER	\N	0	0942679771			f	t	2026-03-04 21:00:08.113	{}	\N
90	تقي العربي	\N	0926433747	CUSTOMER	\N	0	0926433747			f	t	2026-03-04 21:01:10.802	{}	\N
91	وجدان الفيتوري	\N	0915303277	CUSTOMER	\N	0	0915303277			f	t	2026-03-04 21:01:46.117	{}	\N
92	عبدالله الراجحي	\N	0922306018	CUSTOMER	\N	0	0922306018			f	t	2026-03-04 21:22:48.069	{}	\N
93	صابرين عثمان	\N	0926147289	CUSTOMER	\N	0	0926147289			f	t	2026-03-04 21:23:16.359	{}	\N
94	عبدالناصر تيجي	\N	0919484201	CUSTOMER	\N	0	0919484201			f	t	2026-03-04 21:23:41.656	{}	\N
95	خليفة احمد	\N	0918419040	CUSTOMER	\N	0	0918419040			f	t	2026-03-04 21:24:07.695	{}	\N
96	رتاج عمر	\N	0910302918	CUSTOMER	\N	0	0910302918			f	t	2026-03-04 21:24:27.793	{}	\N
97	نور عبدالواحد	\N	0945473841	CUSTOMER	\N	0	0945473841			f	t	2026-03-04 21:24:59.461	{}	\N
98	علا المسلاتي	\N	0921431246	CUSTOMER	\N	0	0921431246			f	t	2026-03-04 21:25:23.815	{}	\N
99	عبدو النعاجي	\N	0922266147	CUSTOMER	\N	0	0922266147			f	t	2026-03-04 21:25:50.923	{}	\N
100	دعاء البدري	\N	0914834896	CUSTOMER	\N	0	0914834896			f	t	2026-03-04 21:26:22.645	{}	\N
101	رتاج القماطي	\N	0930247844	CUSTOMER	\N	0	0930247844			f	t	2026-03-04 21:26:48.627	{}	\N
102	فريد احمد	\N	0934185823	CUSTOMER	\N	0	0934185823			f	t	2026-03-04 21:27:11.547	{}	\N
103	محمد المعداني	\N	0928254098	CUSTOMER	\N	0	0928254098			f	t	2026-03-04 21:27:39.463	{}	\N
104	هارون السويح	\N	0919284371	CUSTOMER	\N	0	0919284371			f	t	2026-03-04 21:28:02.516	{}	\N
105	خميس الزنبري	\N	0944879110	CUSTOMER	\N	0	0944879110			f	t	2026-03-04 21:29:01.599	{}	\N
106	محمد زايد	\N	0923692986	CUSTOMER	\N	0	0923692986			f	t	2026-03-04 21:29:26.021	{}	\N
107	حنان زايد	\N	0920995430	CUSTOMER	\N	0	0920995430			f	t	2026-03-04 21:29:56.874	{}	\N
108	عبدالله عامر الذيب 	\N	0916013902	CUSTOMER	\N	0	0916013902			f	t	2026-03-04 21:30:30.317	{}	\N
109	حنان المنتصر	\N	0911541380	CUSTOMER	\N	0	0911541380			f	t	2026-03-04 21:30:54.552	{}	\N
110	ابوبكر الطشاني	\N	0928428954	CUSTOMER	\N	0	0928428954			f	t	2026-03-04 21:31:29.489	{}	\N
111	عمر الحارس	\N	0913991264	CUSTOMER	\N	0	0913991264			f	t	2026-03-04 21:31:52.317	{}	\N
112	هاجر المشلوم 	\N	0910755652	CUSTOMER	\N	0	0910755652			f	t	2026-03-04 21:32:16.42	{}	\N
113	سيف الإسلام سامي	\N	0910028239	CUSTOMER	\N	0	0910028239			f	t	2026-03-04 21:32:48.401	{}	\N
114	عبدالرزاق الشعلة	\N	0926744385	CUSTOMER	\N	0	0926744385			f	t	2026-03-04 21:33:19.331	{}	\N
115	اية المصراتي 	\N	0944092897	CUSTOMER	\N	0	0944092897			f	t	2026-03-04 21:33:44.183	{}	\N
116	رامي ريان	\N	0911028613	CUSTOMER	\N	0	0911028613			f	t	2026-03-04 21:34:09.167	{}	\N
117	معاذ ورشفاني	\N	0942413645	CUSTOMER	\N	0	0942413645			f	t	2026-03-04 21:47:39.415	{}	\N
118	علي معتوق	\N	0920203058	CUSTOMER	\N	0	0920203058			f	t	2026-03-04 21:48:20.46	{}	\N
119	ريحان 	\N	0930326617	CUSTOMER	\N	0	0930326617			f	t	2026-03-04 22:14:39.334	{}	\N
120	عبدالواحد سوق الجمعة	\N	0944934556	CUSTOMER	\N	0	0944934556			f	t	2026-03-04 22:15:12.739	{}	\N
121	ولاء أحمد	\N	0912353821	CUSTOMER	\N	0	0912353821			f	t	2026-03-04 22:15:43.103	{}	\N
122	مسعود دومه	\N	0912604305	CUSTOMER	\N	0	0912604305			f	t	2026-03-04 22:16:05.029	{}	\N
123	ايمان السيليني	\N	0923884437	CUSTOMER	\N	0	0923884437			f	t	2026-03-04 22:16:30.694	{}	\N
124	رتاج اسماعيل	\N	0944450462	CUSTOMER	\N	0	0944450462			f	t	2026-03-04 22:17:01.401	{}	\N
125	احمد بن عامر	\N	0927290009	CUSTOMER	\N	0	0927290009			f	t	2026-03-04 22:17:33.315	{}	\N
126	روان علي	\N	0923804518	CUSTOMER	\N	0	0923804518			f	t	2026-03-04 22:17:51.971	{}	\N
127	مرام سليم	\N	0915617166	CUSTOMER	\N	0	0915617166			f	t	2026-03-04 22:18:17.593	{}	\N
128	هداية الكريكشي	\N	0915962672	CUSTOMER	\N	0	0915962672			f	t	2026-03-04 22:18:49.495	{}	\N
129	زينب محمد 	\N	0916071322	CUSTOMER	\N	0	0916071322			f	t	2026-03-04 22:19:13.63	{}	\N
130	محمد حسن	\N	0947444666	CUSTOMER	\N	0	0947444666			f	t	2026-03-04 22:19:37.213	{}	\N
131	محمد حمودة 	\N	0942983102	CUSTOMER	\N	0	0942983102			f	t	2026-03-04 22:20:03.764	{}	\N
132	انيس محمد	\N	+213556259813	CUSTOMER	\N	0	+213556259813			f	t	2026-03-04 22:20:42.044	{}	\N
133	حمزة سويسي 	\N	0924945679	CUSTOMER	\N	0	0924945679			f	t	2026-03-04 22:21:24.207	{}	\N
134	شهد عبدالحكيم	\N	0923989887	CUSTOMER	\N	0	0923989887			f	t	2026-03-04 22:21:46.919	{}	\N
135	امحمد البيرة	\N	0913121671	CUSTOMER	\N	0	0913121671			f	t	2026-03-04 22:22:09.6	{}	\N
136	امنة الحكيم	\N	0919653409	CUSTOMER	\N	0	0919653409			f	t	2026-03-04 22:22:47.063	{}	\N
137	هالة عمر	\N	0930257591	CUSTOMER	\N	0	0930257591			f	t	2026-03-04 22:23:31.184	{}	\N
138	مبلاد 	\N	0924861153	CUSTOMER	\N	0	0924861153			f	t	2026-03-04 22:23:59.521	{}	\N
139	مريم جابر	\N	0912277411	CUSTOMER	\N	0	0912277411			f	t	2026-03-04 22:24:19.111	{}	\N
140	تغريد زقلام	\N	0914929274	CUSTOMER	\N	0	0914929274			f	t	2026-03-04 22:25:07.098	{}	\N
141	اية علي	\N	0927568716	CUSTOMER	\N	0	0927568716			f	t	2026-03-04 22:25:54.877	{}	\N
142	محمد ابراهيم	\N	0917703123	CUSTOMER	\N	0	0917703123			f	t	2026-03-04 22:26:17.468	{}	\N
143	احمد الصكلول	\N	0916440666	CUSTOMER	\N	0	0916440666			f	t	2026-03-04 22:26:41.528	{}	\N
145	احمد البرعصي	\N	0945789747	CUSTOMER	\N	0	0945789747			f	t	2026-03-04 22:27:31.282	{}	\N
146	وسام الصبراتي	\N	0910388190	CUSTOMER	\N	0	0910388190			f	t	2026-03-04 22:27:59.256	{}	\N
147	نور العوكلي	\N	0912706297	CUSTOMER	\N	0	0912706297			f	t	2026-03-04 22:28:33.774	{}	\N
148	مكتبة الرائد	\N	0915666678	CUSTOMER	\N	0	0915666678			f	t	2026-03-04 22:28:54.606	{}	\N
149	رضا انبيه	\N	0928611123	CUSTOMER	\N	0	0928611123			f	t	2026-03-04 22:29:13.867	{}	\N
150	اروى خليفة	\N	0944435560	CUSTOMER	\N	0	0944435560			f	t	2026-03-04 22:29:43.475	{}	\N
151	اماني محفوظ	\N	0915854672	CUSTOMER	\N	0	0915854672			f	t	2026-03-04 22:30:12.091	{}	\N
152	محمود خليفة 	\N	0913150116	CUSTOMER	\N	0	0913150116			f	t	2026-03-04 22:30:36.106	{}	\N
153	صابرين عبدالسلام	\N	0921169723	CUSTOMER	\N	0	0921169723			f	t	2026-03-04 22:31:01.665	{}	\N
154	ملاك الطاهر	\N	0914431646	CUSTOMER	\N	0	0914431646			f	t	2026-03-04 22:31:33.273	{}	\N
155	اميرة بن شعبان	\N	0925200856	CUSTOMER	\N	0	0925200856			f	t	2026-03-04 22:31:57.959	{}	\N
5	محمد ابورقيقة	wissam.almsalati@gmail.com	922101220	CUSTOMER	\N	0	922101220	\N	\N	f	t	2026-03-04 19:38:51.814	{dA2xvrsA90VuhjTxzmnxXZ:APA91bG_M-DAShljMOmHx8hXK85f5FIJWoF4xKCcPCjmYmN3KCMM4BBCeMcr8YZVlCNjJMBuNMmRr41qvdVr57OdC0KBhoCW-3uybBHBc265VNnLLS9-bjM,d_W0-ZIBuENAt_uI4y5qw0:APA91bGwG1Q4dzXV6hF97169pUfVLJpIW4JF1IM9wqP0_ovMz-_RQMKDhqujoMvau52yB8y6FInrWElBhMdhnokN2w3Yflj7-DawXav_hT-JaAbZ5R4bQL4}	الخمس
156	مشتريات 	\N	0920511274	CUSTOMER	\N	0	0920511274			f	t	2026-03-04 22:33:27.644	{}	\N
157	محمد الصفراني	\N	0922855819	CUSTOMER	\N	0	0922855819			f	t	2026-03-04 22:33:55.775	{}	\N
158	وائل احتيوش	\N	0917215376	CUSTOMER	\N	0	0917215376			f	t	2026-03-04 22:35:52.832	{}	\N
159	محمد فتحي بن اسماعيل	\N	0910847877	CUSTOMER	\N	0	0910847877			f	t	2026-03-04 22:36:26.638	{}	\N
160	محمد بشون	\N	0943457848	CUSTOMER	\N	0	0943457848			f	t	2026-03-04 22:36:56.54	{}	\N
161	فيصل العامري	\N	0912825742	CUSTOMER	\N	0	0912825742			f	t	2026-03-04 22:37:36.496	{}	\N
162	اسراء الورفلي	\N	0926695128	CUSTOMER	\N	0	0926695128			f	t	2026-03-04 22:38:02.33	{}	\N
163	اسماء الرقيق	\N	+447788950840	CUSTOMER	\N	0	+447788950840			f	t	2026-03-04 22:38:42.697	{}	\N
164	مهيمن بن عاشور	\N	0920535205	CUSTOMER	\N	0	0920535205			f	t	2026-03-04 22:40:20.101	{}	\N
165	جلال احمد 	\N	0943180774	CUSTOMER	\N	0	0943180774			f	t	2026-03-04 22:40:47.279	{}	\N
166	محمد بن حليم	\N	0911744482	CUSTOMER	\N	0	0911744482			f	t	2026-03-04 22:42:04.031	{}	\N
167	ضياء ابوزريبة	\N	0919421544	CUSTOMER	\N	0	0919421544			f	t	2026-03-04 22:42:37.937	{}	\N
168	سندس ادريس عيسى	\N	0923605490	CUSTOMER	\N	0	0923605490			f	t	2026-03-04 22:43:30.021	{}	\N
169	ادريس العقبي	\N	0917716699	CUSTOMER	\N	0	0917716699			f	t	2026-03-04 22:43:54.597	{}	\N
144	ميسي المجال وسام	wissamalmsalati@gmail.com	0910222996	CUSTOMER	\N	0	0910222996			f	t	2026-03-04 22:27:07.455	{d_W0-ZIBuENAt_uI4y5qw0:APA91bGwG1Q4dzXV6hF97169pUfVLJpIW4JF1IM9wqP0_ovMz-_RQMKDhqujoMvau52yB8y6FInrWElBhMdhnokN2w3Yflj7-DawXav_hT-JaAbZ5R4bQL4}	\N
171	تقوى احمد	\N	0923346671	CUSTOMER	\N	0	0923346671			f	t	2026-03-05 00:02:49.299	{}	\N
212	مودة محمد	\N	0910432113	CUSTOMER	\N	0	0910432113			f	t	2026-03-05 01:38:53.295	{}	\N
213	فرح العلام	\N	0944627281	CUSTOMER	\N	0	0944627281			f	t	2026-03-05 01:40:15.585	{}	\N
214	سارة الشيباني	\N	0945079317	CUSTOMER	\N	0	0945079317			f	t	2026-03-05 01:40:58.326	{}	\N
215	محمد الرياني 	\N	0916690081	CUSTOMER	\N	0	0916690081			f	t	2026-03-05 01:41:26.677	{}	\N
216	معتز الصلابي	\N	0945742088	CUSTOMER	\N	0	0945742088			f	t	2026-03-05 01:41:55.93	{}	\N
217	احمد بلقاسم	\N	0923520678	CUSTOMER	\N	0	0923520678			f	t	2026-03-05 01:42:35.585	{}	\N
218	سالم الغرياني	\N	0916150509	CUSTOMER	\N	0	0916150509			f	t	2026-03-05 01:42:59.192	{}	\N
219	فاطمة الزحاف	\N	526344796	CUSTOMER	\N	0	526344796			f	t	2026-03-05 01:44:13.684	{}	\N
220	دعاء دعوش	\N	0912929366	CUSTOMER	\N	0	0912929366			f	t	2026-03-05 01:44:40.777	{}	\N
221	جواد الحميدي	\N	0914927610	CUSTOMER	\N	0	0914927610			f	t	2026-03-05 01:45:01.707	{}	\N
222	محمد عامر	\N	0925288763	CUSTOMER	\N	0	0925288763			f	t	2026-03-05 01:45:24.558	{}	\N
223	إيلاف المختار	\N	0944769962	CUSTOMER	\N	0	0944769962			f	t	2026-03-06 04:12:22.586	{}	\N
\.


--
-- Data for Name: Warehouse; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public."Warehouse" (id, name, country) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: wissam_dev
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
703e4a40-279f-4727-a515-9e19c0037d75	54f5211cc81401483412c73cc9f681c5098980dba56e209929bed1d07ece1a81	2026-03-03 21:04:49.193423+00	20251121202749_add_user_suspended_field		\N	2026-03-03 21:04:49.193423+00	0
9f082782-350e-4ed7-8346-d77b50bdf906	97fe842f0854c71bd4bff899d515f46fc8e372205a145871e23f7d2ab361b5f2	2026-03-03 21:04:56.271224+00	20251121231307_add_customer_codes		\N	2026-03-03 21:04:56.271224+00	0
8740136b-88aa-453f-9279-a0007751abeb	8e431dd43113d88d60fa212c0cfae82890c005165352a4f1f8ccd8fe0be2b175	2026-03-03 21:05:03.745192+00	20251121231711_rename_abuhaj_to_turkey		\N	2026-03-03 21:05:03.745192+00	0
f2931fbb-c14c-41f2-a651-224c692fb576	d8af1cd53484dadca914b29dc4cfb3c06a5f968c0df80316751489e5ab6ca2fe	2026-03-03 21:05:10.674981+00	20251124162718_add_announcements		\N	2026-03-03 21:05:10.674981+00	0
64e586a3-4bfc-4e04-8a97-08bb1c7029c1	22043baab1be10872b51aa2e19a03d24399c6eba1d7d18c8897785b740d388da	2026-03-03 21:05:17.889922+00	20251124163305_add_country_fields		\N	2026-03-03 21:05:17.889922+00	0
22ed48aa-b77d-47fb-af66-8f2dd8ab00a7	0a1a2a49263bf06e1fbd4620967ce84323533113d90c4e9ce0df5bebfae8b53f	2026-03-03 21:05:24.720764+00	20251124172120_add_announcement_is_active		\N	2026-03-03 21:05:24.720764+00	0
1a8b6c4f-6ebf-432e-9f8b-b511cb6dcaae	e3d64e054b1a315dcf513fc9a0e3c7f22835296ce998545ecf21929a06612151	2026-03-03 21:05:31.911671+00	20251125001039_add_message_images_and_read_tracking		\N	2026-03-03 21:05:31.911671+00	0
8911a0dd-5fc2-4938-a34d-3614167ee811	a57076c0013e7d76a9427b67b69442682c3e7a6dc0d69278bcc27e33d1dbecc4	2026-03-03 21:05:38.876624+00	20251125180044_add_pending_registration		\N	2026-03-03 21:05:38.876624+00	0
b9910b74-818e-465e-b65c-be195ec03235	b694afe9d665d971db7120a2ad5766697d7531ce479b3d2984dcd9b14b835ba7	2026-03-03 21:05:46.195756+00	20251201102324_add_user_approval		\N	2026-03-03 21:05:46.195756+00	0
3d43ba1a-c3e8-48e9-b690-18bbcc1bd048	920dd1f96983d55a1291d840cfa9ff08ee6a4de410fb0595e301269b444c6133	2026-03-04 19:19:24.441336+00	20260304000000_add_site_settings_and_change_log	\N	\N	2026-03-04 19:19:24.322587+00	1
\.


--
-- Name: Announcement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."Announcement_id_seq"', 1, false);


--
-- Name: Customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."Customer_id_seq"', 225, true);


--
-- Name: Flight_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."Flight_id_seq"', 1, true);


--
-- Name: Notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."Notification_id_seq"', 80, true);


--
-- Name: OrderLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."OrderLog_id_seq"', 52, true);


--
-- Name: OrderMessage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."OrderMessage_id_seq"', 1, false);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."Order_id_seq"', 25, true);


--
-- Name: PasswordResetCode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."PasswordResetCode_id_seq"', 2, true);


--
-- Name: PendingRegistration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."PendingRegistration_id_seq"', 1, false);


--
-- Name: SettingsChangeLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."SettingsChangeLog_id_seq"', 1, true);


--
-- Name: ShipmentItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."ShipmentItem_id_seq"', 1, false);


--
-- Name: Shipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."Shipment_id_seq"', 1, false);


--
-- Name: ShippingRate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."ShippingRate_id_seq"', 48, true);


--
-- Name: Transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."Transaction_id_seq"', 28, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."User_id_seq"', 223, true);


--
-- Name: Warehouse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wissam_dev
--

SELECT pg_catalog.setval('public."Warehouse_id_seq"', 33, true);


--
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: Flight Flight_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Flight"
    ADD CONSTRAINT "Flight_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderLog OrderLog_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."OrderLog"
    ADD CONSTRAINT "OrderLog_pkey" PRIMARY KEY (id);


--
-- Name: OrderMessage OrderMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."OrderMessage"
    ADD CONSTRAINT "OrderMessage_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetCode PasswordResetCode_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."PasswordResetCode"
    ADD CONSTRAINT "PasswordResetCode_pkey" PRIMARY KEY (id);


--
-- Name: PendingRegistration PendingRegistration_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."PendingRegistration"
    ADD CONSTRAINT "PendingRegistration_pkey" PRIMARY KEY (id);


--
-- Name: SettingsChangeLog SettingsChangeLog_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."SettingsChangeLog"
    ADD CONSTRAINT "SettingsChangeLog_pkey" PRIMARY KEY (id);


--
-- Name: ShipmentItem ShipmentItem_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."ShipmentItem"
    ADD CONSTRAINT "ShipmentItem_pkey" PRIMARY KEY (id);


--
-- Name: Shipment Shipment_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Shipment"
    ADD CONSTRAINT "Shipment_pkey" PRIMARY KEY (id);


--
-- Name: ShippingRate ShippingRate_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."ShippingRate"
    ADD CONSTRAINT "ShippingRate_pkey" PRIMARY KEY (id);


--
-- Name: SiteSettings SiteSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_pkey" PRIMARY KEY (key);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Warehouse Warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Warehouse"
    ADD CONSTRAINT "Warehouse_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Customer_code_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "Customer_code_key" ON public."Customer" USING btree (code);


--
-- Name: Customer_dubaiCode_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "Customer_dubaiCode_key" ON public."Customer" USING btree ("dubaiCode");


--
-- Name: Customer_turkeyCode_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "Customer_turkeyCode_key" ON public."Customer" USING btree ("turkeyCode");


--
-- Name: Customer_usaCode_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "Customer_usaCode_key" ON public."Customer" USING btree ("usaCode");


--
-- Name: Customer_userId_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "Customer_userId_key" ON public."Customer" USING btree ("userId");


--
-- Name: Flight_flightNumber_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "Flight_flightNumber_key" ON public."Flight" USING btree ("flightNumber");


--
-- Name: Order_trackingNumber_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "Order_trackingNumber_key" ON public."Order" USING btree ("trackingNumber");


--
-- Name: PasswordResetCode_email_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "PasswordResetCode_email_key" ON public."PasswordResetCode" USING btree (email);


--
-- Name: PendingRegistration_email_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "PendingRegistration_email_key" ON public."PendingRegistration" USING btree (email);


--
-- Name: PendingRegistration_mobile_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "PendingRegistration_mobile_key" ON public."PendingRegistration" USING btree (mobile);


--
-- Name: Shipment_shipmentId_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "Shipment_shipmentId_key" ON public."Shipment" USING btree ("shipmentId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_mobile_key; Type: INDEX; Schema: public; Owner: wissam_dev
--

CREATE UNIQUE INDEX "User_mobile_key" ON public."User" USING btree (mobile);


--
-- Name: Customer Customer_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderLog OrderLog_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."OrderLog"
    ADD CONSTRAINT "OrderLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderMessage OrderMessage_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."OrderMessage"
    ADD CONSTRAINT "OrderMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderMessage OrderMessage_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."OrderMessage"
    ADD CONSTRAINT "OrderMessage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderMessage OrderMessage_replyToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."OrderMessage"
    ADD CONSTRAINT "OrderMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES public."OrderMessage"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_flightId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES public."Flight"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_shippingRateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_shippingRateId_fkey" FOREIGN KEY ("shippingRateId") REFERENCES public."ShippingRate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ShipmentItem ShipmentItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."ShipmentItem"
    ADD CONSTRAINT "ShipmentItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ShipmentItem ShipmentItem_shipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."ShipmentItem"
    ADD CONSTRAINT "ShipmentItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES public."Shipment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Shipment Shipment_fromWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Shipment"
    ADD CONSTRAINT "Shipment_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES public."Warehouse"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Shipment Shipment_toWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Shipment"
    ADD CONSTRAINT "Shipment_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES public."Warehouse"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wissam_dev
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict zypzCST3LKdTYoh79SkJB63hIIXYsu8rUFrK4Q1fsfEEAFuquZXfrLQ77c8Ysgg

