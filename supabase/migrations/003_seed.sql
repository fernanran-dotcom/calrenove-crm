-- Seed: Companies, Brands, Models, Includes, Excludes, Optionals
-- Data migrated from data/modelos.js of the existing app

-- ============================================================
-- COMPANIES
-- ============================================================
insert into public.companies (id, name, slug, logo_url, color, color_light, address) values
  ('a0000000-0000-0000-0000-000000000001', 'Calrenove', 'calrenove', '/img/logo-calrenove.png', '#cc092f', '#e8304f', 'Bizkaia'),
  ('a0000000-0000-0000-0000-000000000002', 'Norcaldera', 'norcaldera', '/img/logo-norcaldera.png', '#00917e', '#00b89f', 'Bizkaia'),
  ('a0000000-0000-0000-0000-000000000003', 'Calefacciones Mimetiz', 'calderas-calefaccion', '/img/logo-calderas.png', '#005691', '#2d7fc1', null);

-- ============================================================
-- BRANDS
-- ============================================================
insert into public.boiler_brands (id, name, slug) values
  ('b0000000-0000-0000-0000-000000000001', 'Saunier Duval', 'saunier-duval'),
  ('b0000000-0000-0000-0000-000000000002', 'Vaillant', 'vaillant'),
  ('b0000000-0000-0000-0000-000000000003', 'Protherm', 'protherm'),
  ('b0000000-0000-0000-0000-000000000004', 'Junkers / Bosch', 'junkers-bosch'),
  ('b0000000-0000-0000-0000-000000000005', 'Ariston', 'ariston'),
  ('b0000000-0000-0000-0000-000000000006', 'Kosner', 'kosner'),
  ('b0000000-0000-0000-0000-000000000007', 'Warmhaus', 'warmhaus');

-- ============================================================
-- SAUNIER DUVAL MODELS
-- ============================================================
with brand as (select id from public.boiler_brands where slug = 'saunier-duval')
insert into public.boiler_models (id, brand_id, name, slug, description, price_base, price_final, price_rounded, notes) values
  ('c0000000-0000-0000-0000-000000000001', (select id from brand),
    'Hermann MicraCom Condens 24', 'hermann-micracom-24',
    'Caldera de condensación Hermann MicraCom Condens 24-AS/1 (H-ES) Gas Natural. Transformable a propano.',
    1550.00, 1875.50, 1899, null),
  ('c0000000-0000-0000-0000-000000000002', (select id from brand),
    'Hermann MicraCom Condens 28', 'hermann-micracom-28',
    'Caldera de condensación Hermann MicraCom Condens 28-AS/1 (H-ES) Gas Natural. Transformable a propano.',
    1726.45, 2089.00, 2089, null),
  ('c0000000-0000-0000-0000-000000000003', (select id from brand),
    'Hermann Micraplus 25', 'hermann-micraplus-25',
    'Caldera de condensación Hermann Micraplus 25-AS/1 (H-ES) Gas Natural.',
    1559.50, 1887.00, 1887, null),
  ('c0000000-0000-0000-0000-000000000004', (select id from brand),
    'Hermann Micraplus 30', 'hermann-micraplus-30',
    'Caldera de condensación Hermann Micraplus 30-AS/1 (H-ES) Gas Natural.',
    1652.07, 1999.00, 1999, null),
  ('c0000000-0000-0000-0000-000000000005', (select id from brand),
    'Saunier Duval Thelia Condens 25', 'saunier-thelia-25',
    'Caldera de condensación Saunier Duval Thelia Condens 25 Mixta Gas Natural.',
    1917.36, 2320.00, 2320,
    'El desagüe de los condensados se realizará en un recipiente ubicado bajo la caldera.'),
  ('c0000000-0000-0000-0000-000000000006', (select id from brand),
    'Saunier Duval Thema MiConnect 26 Cableada', 'saunier-thema-26-cable',
    'Caldera de condensación Saunier Duval Thema MiConnect® 26-CS/1-C (N-ES). Con termostato de control MiSet cableado.',
    2173.55, 2630.00, 2630,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000007', (select id from brand),
    'Saunier Duval Thema MiConnect 31 MiSet Radio', 'saunier-thema-31-radio',
    'Caldera de condensación Saunier Duval Thema MiConnect® 31-CS/1-Cf (N-ES). Con termostato de control MiSet radio.',
    2611.57, 3160.00, 3160,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000008', (select id from brand),
    'Saunier Duval Thema MiConnect 31 Cableada', 'saunier-thema-31-cable',
    'Caldera de condensación Saunier Duval Thema MiConnect® 31-CS/1-C (N-ES). Con termostato de control MiSet cableado.',
    2561.57, 3099.00, 3099,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000009', (select id from brand),
    'Saunier Duval ThemaFast MiConnect 26 Cableada', 'saunier-themafast-26-cable',
    'Caldera de condensación Saunier Duval ThemaFast MiConnect® MA 26-CS/1-C (N-ES). Con termostato de control MiSet cableado.',
    2230.58, 2699.00, 2699,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000010', (select id from brand),
    'Saunier Duval ThemaFast MiConnect 26 Miset Radio', 'saunier-themafast-26-radio',
    'Caldera de condensación Saunier Duval ThemaFast MiConnect® MA 26-CS/1-C (N-ES). Con termostato de control MiSet radio.',
    2271.90, 2749.00, 2749,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000011', (select id from brand),
    'Saunier Duval ThemaTek Condens 24', 'saunier-thematek-24',
    'Caldera de condensación Saunier Duval ThemaTek Condens 24-AS/2-C (H-ES). La más compacta de Saunier Duval. Control modulante Exacontrol Select SRT50/2 incluido de serie.',
    1750.00, 2117.50, 2118,
    'Incluye control modulante Exacontrol Select SRT50/2 cableado de serie.'),
  ('c0000000-0000-0000-0000-000000000012', (select id from brand),
    'Saunier Duval ThemaTek Condens 28', 'saunier-thematek-28',
    'Caldera de condensación Saunier Duval ThemaTek Condens 28-AS/2-C (H-ES). La más compacta de Saunier Duval. Control modulante Exacontrol Select SRT50/2 incluido de serie.',
    1900.00, 2299.00, 2299,
    'Incluye control modulante Exacontrol Select SRT50/2 cableado de serie.');

-- SAUNIER DUVAL INCLUDES/EXCLUDES/OPTIONALS
-- Hermann MicraCom 24 includes
insert into public.model_includes (model_id, description, sort_order)
select id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1 from public.boiler_models where slug = 'hermann-micracom-24' union all
select id, 'Retirada del aparato antiguo a punto limpio', 2 from public.boiler_models where slug = 'hermann-micracom-24' union all
select id, 'Conexionado de fontanería, gas y electricidad', 3 from public.boiler_models where slug = 'hermann-micracom-24' union all
select id, 'Conexionado de termostato ambiente existente', 4 from public.boiler_models where slug = 'hermann-micracom-24' union all
select id, 'Kit de salida de humos (codo 90° + tramo terminal ~80cm) con evacuación a fachada o terraza abierta', 5 from public.boiler_models where slug = 'hermann-micracom-24' union all
select id, 'Necesario desagüe de PVC cercano y accesible, o recipiente bajo la caldera', 6 from public.boiler_models where slug = 'hermann-micracom-24';

insert into public.model_excludes (model_id, description, sort_order)
select id, 'Termostato modulante compatible', 1 from public.boiler_models where slug = 'hermann-micracom-24' union all
select id, 'Cambio de ubicación del aparato', 2 from public.boiler_models where slug = 'hermann-micracom-24' union all
select id, 'Trabajos de albañilería, pintura, etc.', 3 from public.boiler_models where slug = 'hermann-micracom-24';

-- Hermann MicraCom 28 includes
insert into public.model_includes (model_id, description, sort_order)
select id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1 from public.boiler_models where slug = 'hermann-micracom-28' union all
select id, 'Retirada del aparato antiguo a punto limpio', 2 from public.boiler_models where slug = 'hermann-micracom-28' union all
select id, 'Conexionado de fontanería, gas y electricidad', 3 from public.boiler_models where slug = 'hermann-micracom-28' union all
select id, 'Conexionado de termostato ambiente existente', 4 from public.boiler_models where slug = 'hermann-micracom-28' union all
select id, 'Kit de salida de humos (codo 90° + tramo terminal ~80cm)', 5 from public.boiler_models where slug = 'hermann-micracom-28';

insert into public.model_excludes (model_id, description, sort_order)
select id, 'Termostato modulante compatible', 1 from public.boiler_models where slug = 'hermann-micracom-28' union all
select id, 'Cambio de ubicación del aparato', 2 from public.boiler_models where slug = 'hermann-micracom-28' union all
select id, 'Trabajos de albañilería, pintura, etc.', 3 from public.boiler_models where slug = 'hermann-micracom-28';

-- Micraplus 25 includes/excludes
insert into public.model_includes (model_id, description, sort_order)
select id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1 from public.boiler_models where slug = 'hermann-micraplus-25' union all
select id, 'Retirada del aparato antiguo a punto limpio', 2 from public.boiler_models where slug = 'hermann-micraplus-25' union all
select id, 'Conexionado de fontanería, gas y electricidad', 3 from public.boiler_models where slug = 'hermann-micraplus-25' union all
select id, 'Kit de salida de humos', 4 from public.boiler_models where slug = 'hermann-micraplus-25';

insert into public.model_excludes (model_id, description, sort_order)
select id, 'Termostato', 1 from public.boiler_models where slug = 'hermann-micraplus-25' union all
select id, 'Cambio de ubicación del aparato', 2 from public.boiler_models where slug = 'hermann-micraplus-25' union all
select id, 'Trabajos de albañilería, pintura, etc.', 3 from public.boiler_models where slug = 'hermann-micraplus-25';

-- Micraplus 30 includes/excludes
insert into public.model_includes (model_id, description, sort_order)
select id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1 from public.boiler_models where slug = 'hermann-micraplus-30' union all
select id, 'Retirada del aparato antiguo a punto limpio', 2 from public.boiler_models where slug = 'hermann-micraplus-30' union all
select id, 'Conexionado de fontanería, gas y electricidad', 3 from public.boiler_models where slug = 'hermann-micraplus-30' union all
select id, 'Kit de salida de humos', 4 from public.boiler_models where slug = 'hermann-micraplus-30';

insert into public.model_excludes (model_id, description, sort_order)
select id, 'Termostato', 1 from public.boiler_models where slug = 'hermann-micraplus-30' union all
select id, 'Cambio de ubicación del aparato', 2 from public.boiler_models where slug = 'hermann-micraplus-30' union all
select id, 'Trabajos de albañilería, pintura, etc.', 3 from public.boiler_models where slug = 'hermann-micraplus-30';

-- Thelia 25 includes/excludes/optionals
insert into public.model_includes (model_id, description, sort_order)
select id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1 from public.boiler_models where slug = 'saunier-thelia-25' union all
select id, 'Retirada del aparato antiguo a punto limpio', 2 from public.boiler_models where slug = 'saunier-thelia-25' union all
select id, 'Conexionado de fontanería, gas y electricidad', 3 from public.boiler_models where slug = 'saunier-thelia-25' union all
select id, 'Kit de salida de humos y materiales para su instalación', 4 from public.boiler_models where slug = 'saunier-thelia-25';

insert into public.model_excludes (model_id, description, sort_order)
select id, 'Termostato modulante', 1 from public.boiler_models where slug = 'saunier-thelia-25' union all
select id, 'Cambio de ubicación del aparato', 2 from public.boiler_models where slug = 'saunier-thelia-25' union all
select id, 'Trabajos de albañilería, pintura, etc.', 3 from public.boiler_models where slug = 'saunier-thelia-25';

-- Optionals for the models that have them
-- Hermann MicraCom 24 optional
insert into public.model_optionals (model_id, name, price, sort_order)
select id, 'Termostato modulante ThermoLink select', 96, 1 from public.boiler_models where slug = 'hermann-micracom-24';

-- Hermann MicraCom 28 optional
insert into public.model_optionals (model_id, name, price, sort_order)
select id, 'Termostato modulante ThermoLink select', 96, 1 from public.boiler_models where slug = 'hermann-micracom-28';

-- Thelia 25 optional
insert into public.model_optionals (model_id, name, price, sort_order)
select id, 'Termostato Modulante Room Thermostat HRT 50/2', 102, 1 from public.boiler_models where slug = 'saunier-thelia-25';

-- ThemaTek 24 optional
insert into public.model_optionals (model_id, name, price, sort_order)
select id, 'Módulo MiGo Link para conexión WiFi', 120, 1 from public.boiler_models where slug = 'saunier-thematek-24';

-- ThemaTek 28 optional
insert into public.model_optionals (model_id, name, price, sort_order)
select id, 'Módulo MiGo Link para conexión WiFi', 120, 1 from public.boiler_models where slug = 'saunier-thematek-28';

-- For the remaining Saunier Duval models (thema-26-cable, thema-31-radio, thema-31-cable, themafast-26-cable, themafast-26-radio)
-- they have includes but no optionals. Add their includes.
do $$
declare
  model_slugs text[] := array['saunier-thema-26-cable', 'saunier-thema-31-radio', 'saunier-thema-31-cable', 'saunier-themafast-26-cable', 'saunier-themafast-26-radio'];
  v_slug text;
  model_id uuid;
begin
  foreach v_slug in array model_slugs loop
    select id into model_id from public.boiler_models where slug = v_slug;

    insert into public.model_includes (model_id, description, sort_order) values
      (model_id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1),
      (model_id, 'Retirada del aparato antiguo a punto limpio', 2),
      (model_id, 'Conexionado de fontanería, gas y electricidad', 3),
      (model_id, 'Kit de salida de humos y materiales para su instalación', 4);

    -- Add specific extra include if not themafast
    if v_slug not like 'saunier-themafast%' then
      insert into public.model_includes (model_id, description, sort_order)
      values (model_id, 'Termostato de control MiSet cableado', 5);
    end if;

    insert into public.model_excludes (model_id, description, sort_order) values
      (model_id, 'Cambio de ubicación del aparato', 1),
      (model_id, 'Trabajos de albañilería, pintura, etc.', 2);
  end loop;
end $$;

-- ThemaFast 26 radio has different include (radio instead of cable)
insert into public.model_includes (model_id, description, sort_order)
select id, 'Termostato de control MiSet radio', 5 from public.boiler_models where slug = 'saunier-themafast-26-radio';

-- ============================================================
-- VAILLANT MODELS
-- ============================================================
with brand as (select id from public.boiler_brands where slug = 'vaillant')
insert into public.boiler_models (id, brand_id, name, slug, description, price_base, price_final, price_rounded, notes) values
  ('c0000000-0000-0000-0000-000000000020', (select id from brand),
    'Vaillant ecoTEC Plus 26 Cableada', 'vaillant-ecotec-26-cable',
    'Caldera de condensación Vaillant ecoTEC plus VMW 26 CS/1-5 C. Incluye termostato SensoHome cableado de serie.',
    2175.21, 2749.00, 2749,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000021', (select id from brand),
    'Vaillant ecoTEC Plus radio VMW 26', 'vaillant-ecotec-plus-26-radio',
    'Caldera mural mixta de condensación Vaillant ecoTEC plus VMW 26 CS/1-5 CF R1. Incluye termostato radio de serie.',
    2220.00, 2799.00, 2799,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000022', (select id from brand),
    'Vaillant ecoTEC Plus 32 Cableada', 'vaillant-ecotec-32-cable',
    'Caldera de condensación Vaillant ecoTEC plus VMW 32 CS/1-5 C (N-ES). Incluye termostato SensoHome cableado de serie.',
    2420.00, 2899.00, 2899,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000023', (select id from brand),
    'Vaillant ecoTEC Plus radio VMW 32', 'vaillant-ecotec-32-radio',
    'Caldera de condensación Vaillant ecoTEC plus VMW 32 CS/1-5 Cf (N-ES). Incluye termostato SensoHome radio de serie.',
    2465.00, 2949.00, 2949,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000024', (select id from brand),
    'Vaillant ecoTEC Plus radio VMW 36', 'vaillant-ecotec-36-radio',
    'Caldera de condensación Vaillant ecoTEC plus VMW 36 CS/1-5 Cf (N-ES). Incluye termostato SensoHome radio de serie.',
    2599.00, 3099.00, 3099,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000025', (select id from brand),
    'Vaillant ecoTEC Plus 36 Cableada', 'vaillant-ecotec-36-cable',
    'Caldera de condensación Vaillant ecoTEC plus VMW 36 CS/1-5 C (N-ES). Incluye termostato SensoHome cableado de serie.',
    2550.00, 3049.00, 3049,
    'Este presupuesto incluye la instalación de la caldera en la ubicación de la caldera preexistente.'),
  ('c0000000-0000-0000-0000-000000000026', (select id from brand),
    'Vaillant ecoTEC intro VMW 24/24', 'vaillant-ecotec-intro-24',
    'Caldera de condensación Vaillant ecoTEC intro VMW 24/24 AS/2-1C (H-ES). Ultracompacta. Control modulante sensoROOM pure VRT50/2 incluido de serie.',
    1700.00, 2057.00, 2057,
    'Incluye control modulante sensoROOM pure VRT50/2 cableado de serie.'),
  ('c0000000-0000-0000-0000-000000000027', (select id from brand),
    'Vaillant ecoTEC intro VMW 28/28', 'vaillant-ecotec-intro-28',
    'Caldera de condensación Vaillant ecoTEC intro VMW 28/28 AS/2-1C (H-ES). Ultracompacta. Control modulante sensoROOM pure VRT50/2 incluido de serie.',
    1850.00, 2238.50, 2239,
    'Incluye control modulante sensoROOM pure VRT50/2 cableado de serie.');

-- Vaillant includes/excludes (same pattern for all)
do $$
declare
  r record;
begin
  for r in select id, slug from public.boiler_models where slug like 'vaillant-%' loop
    insert into public.model_includes (model_id, description, sort_order) values
      (r.id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1),
      (r.id, 'Retirada del aparato antiguo a punto limpio', 2),
      (r.id, 'Conexionado de fontanería, gas y electricidad', 3),
      (r.id, 'Kit de salida de humos y materiales para su instalación', 4);
    if r.slug like '%-cable' then
      insert into public.model_includes (model_id, description, sort_order)
      values (r.id, 'Termostato SensoHome cableado de serie', 5);
    elsif r.slug like '%-radio' then
      insert into public.model_includes (model_id, description, sort_order)
      values (r.id, 'Termostato radio de serie', 5);
    elsif r.slug like '%-intro-%' then
      insert into public.model_includes (model_id, description, sort_order)
      values (r.id, 'Conexionado de termostato ambiente', 5);
    end if;
    insert into public.model_excludes (model_id, description, sort_order) values
      (r.id, 'Cambio de ubicación del aparato', 1),
      (r.id, 'Trabajos de albañilería, pintura, etc.', 2);
  end loop;
end $$;

-- ============================================================
-- PROTHERM MODEL
-- ============================================================
with brand as (select id from public.boiler_brands where slug = 'protherm')
insert into public.boiler_models (id, brand_id, name, slug, description, price_base, price_final, price_rounded)
values ('c0000000-0000-0000-0000-000000000030', (select id from brand),
  'Protherm Puma 18/24', 'protherm-puma-24',
  'Caldera de condensación Protherm Puma 18/24 MKV-AS/1 (H-ES) Gas Natural.',
  1569.42, 1899.00, 1899);

insert into public.model_includes (model_id, description, sort_order)
select id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1 from public.boiler_models where slug = 'protherm-puma-24' union all
select id, 'Retirada del aparato antiguo a punto limpio', 2 from public.boiler_models where slug = 'protherm-puma-24' union all
select id, 'Conexionado de fontanería, gas y electricidad', 3 from public.boiler_models where slug = 'protherm-puma-24' union all
select id, 'Kit de salida de humos y materiales para su instalación', 4 from public.boiler_models where slug = 'protherm-puma-24';

insert into public.model_excludes (model_id, description, sort_order)
select id, 'Termostato', 1 from public.boiler_models where slug = 'protherm-puma-24' union all
select id, 'Cambio de ubicación del aparato', 2 from public.boiler_models where slug = 'protherm-puma-24' union all
select id, 'Trabajos de albañilería, pintura, etc.', 3 from public.boiler_models where slug = 'protherm-puma-24';

insert into public.model_optionals (model_id, name, price, sort_order)
select id, 'Termostato Modulante ThermoLink select', 96, 1 from public.boiler_models where slug = 'protherm-puma-24';

-- ============================================================
-- JUNKERS/BOSCH MODELS
-- ============================================================
with brand as (select id from public.boiler_brands where slug = 'junkers-bosch')
insert into public.boiler_models (id, brand_id, name, slug, description, price_base, price_final, price_rounded) values
  ('c0000000-0000-0000-0000-000000000040', (select id from brand),
    'Junkers Condens 4300i W 24/25', 'junkers-4300i-24-25',
    'Caldera de condensación Junkers Condens 4300i W 24-25 Gas Natural.',
    1871.90, 2265.00, 2265),
  ('c0000000-0000-0000-0000-000000000041', (select id from brand),
    'Bosch Condens 4300iW 24/30', 'bosch-4300iw-24-30',
    'Caldera de condensación Bosch Condens 4300iW 24-30 Gas Natural.',
    2032.23, 2459.00, 2459),
  ('c0000000-0000-0000-0000-000000000042', (select id from brand),
    'Bosch Condens GC1200W 20-24 C23', 'bosch-gc1200w-20-24',
    'Caldera de condensación Bosch Condens GC1200W 20-24 C23 Gas Natural.',
    1635.54, 1979.00, 1979),
  ('c0000000-0000-0000-0000-000000000043', (select id from brand),
    'Bosch Condens GC1200W 24-30 C23', 'bosch-gc1200w-24-30',
    'Caldera de condensación Bosch Condens GC1200W 24-30 C23 Gas Natural.',
    1776.03, 2149.00, 2149);

-- Junkers/Bosch includes/excludes (all same pattern)
do $$
declare
  r record;
begin
  for r in select id from public.boiler_models where brand_id = (select id from public.boiler_brands where slug = 'junkers-bosch') loop
    insert into public.model_includes (model_id, description, sort_order) values
      (r.id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1),
      (r.id, 'Retirada del aparato antiguo a punto limpio', 2),
      (r.id, 'Conexionado de fontanería, gas y electricidad', 3),
      (r.id, 'Kit de salida de humos', 4);
    insert into public.model_excludes (model_id, description, sort_order) values
      (r.id, 'Termostato', 1),
      (r.id, 'Cambio de ubicación del aparato', 2),
      (r.id, 'Trabajos de albañilería, pintura, etc.', 3);
  end loop;
end $$;

-- ============================================================
-- ARISTON MODELS
-- ============================================================
with brand as (select id from public.boiler_brands where slug = 'ariston')
insert into public.boiler_models (id, brand_id, name, slug, description, price_base, price_final, price_rounded) values
  ('c0000000-0000-0000-0000-000000000050', (select id from brand),
    'Ariston Clas One wifi 24FFEU', 'ariston-clas-one-24',
    'Caldera de condensación Ariston Clas One wifi 24FFEU Gas Natural.',
    1600.00, 1936.00, 1936),
  ('c0000000-0000-0000-0000-000000000051', (select id from brand),
    'Ariston Clas One wifi 30FFEU', 'ariston-clas-one-30',
    'Caldera de condensación Ariston Clas One wifi 30FFEU Gas Natural.',
    1750.00, 2117.50, 2118),
  ('c0000000-0000-0000-0000-000000000052', (select id from brand),
    'Ariston Clas One wifi 35FFEU', 'ariston-clas-one-35',
    'Caldera de condensación Ariston Clas One wifi 35FFEU Gas Natural.',
    1900.00, 2299.00, 2299);

do $$
declare
  r record;
begin
  for r in select id from public.boiler_models where brand_id = (select id from public.boiler_brands where slug = 'ariston') loop
    insert into public.model_includes (model_id, description, sort_order) values
      (r.id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1),
      (r.id, 'Retirada del aparato antiguo a punto limpio', 2),
      (r.id, 'Conexionado de fontanería, gas y electricidad', 3),
      (r.id, 'Kit de salida de humos', 4);
    insert into public.model_excludes (model_id, description, sort_order) values
      (r.id, 'Cambio de ubicación del aparato', 1),
      (r.id, 'Trabajos de albañilería, pintura, etc.', 2);
  end loop;
end $$;

-- ============================================================
-- KOSNER MODELS
-- ============================================================
with brand as (select id from public.boiler_brands where slug = 'kosner')
insert into public.boiler_models (id, brand_id, name, slug, description, price_base, price_final, price_rounded) values
  ('c0000000-0000-0000-0000-000000000060', (select id from brand),
    'Kosner Titan HR 24-28', 'kosner-titan-hr-24-28',
    'Caldera de condensación Kosner Titan HR 24-28 Gas Natural.',
    1450.00, 1754.50, 1755),
  ('c0000000-0000-0000-0000-000000000061', (select id from brand),
    'Kosner Titan HR 30-36', 'kosner-titan-hr-30-36',
    'Caldera de condensación Kosner Titan HR 30-36 Gas Natural.',
    1600.00, 1936.00, 1936);

do $$
declare
  r record;
begin
  for r in select id from public.boiler_models where brand_id = (select id from public.boiler_brands where slug = 'kosner') loop
    insert into public.model_includes (model_id, description, sort_order) values
      (r.id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1),
      (r.id, 'Retirada del aparato antiguo a punto limpio', 2),
      (r.id, 'Conexionado de fontanería, gas y electricidad', 3),
      (r.id, 'Kit de salida de humos', 4);
    insert into public.model_excludes (model_id, description, sort_order) values
      (r.id, 'Termostato', 1),
      (r.id, 'Cambio de ubicación del aparato', 2),
      (r.id, 'Trabajos de albañilería, pintura, etc.', 3);
  end loop;
end $$;

-- ============================================================
-- WARMHAUS MODELS
-- ============================================================
with brand as (select id from public.boiler_brands where slug = 'warmhaus')
insert into public.boiler_models (id, brand_id, name, slug, description, price_base, price_final, price_rounded) values
  ('c0000000-0000-0000-0000-000000000070', (select id from brand),
    'Warmhaus Enerwa 33-40', 'warmhaus-enerwa-33-40',
    'Caldera de condensación Warmhaus Enerwa 33-40 Gas Natural.',
    1700.00, 2057.00, 2057),
  ('c0000000-0000-0000-0000-000000000071', (select id from brand),
    'Warmhaus Minerwa 25-31', 'warmhaus-minerwa-25-31',
    'Caldera de condensación Warmhaus Minerwa 25-31 Gas Natural.',
    1550.00, 1875.50, 1876);

do $$
declare
  r record;
begin
  for r in select id from public.boiler_models where brand_id = (select id from public.boiler_brands where slug = 'warmhaus') loop
    insert into public.model_includes (model_id, description, sort_order) values
      (r.id, 'Desmontaje del aparato antiguo y montaje del nuevo en la misma ubicación', 1),
      (r.id, 'Retirada del aparato antiguo a punto limpio', 2),
      (r.id, 'Conexionado de fontanería, gas y electricidad', 3),
      (r.id, 'Kit de salida de humos', 4);
    insert into public.model_excludes (model_id, description, sort_order) values
      (r.id, 'Termostato', 1),
      (r.id, 'Cambio de ubicación del aparato', 2),
      (r.id, 'Trabajos de albañilería, pintura, etc.', 3);
  end loop;
end $$;
