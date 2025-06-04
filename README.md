# **TP-Clinica-Online**

Nuestro sistema, permite tener todo el control y manejo sobre una clinica. 
Permite el alta, baja y modificacion de los distintos perfiles, con sus respectivos atributos, la reserva de turnos y devolucion de la consutla luego de ser atendido.
El sistema contempla distintos tipos de usuario para su buen funcionamiento

### Horarios atencion 🕜

```
lunes a viernes en el horario de 8:00 a 19:00.
sábados en el horario de 8:00 a 14:00.
```


### Usuarios 🔧

_Tenemos 3 tipos de usuarios, ADMINISTRADOR, PROFESIONAL y USUARIO_

```
ADMINISTRADOR_ 
Puede agregar a otros administradores al sistema, y es el unico que puede aceptar a los profesionales para atender en la clinica.
Este mismo puede realizar alta de especialidades, para que esten disponibles en el area de registro.

```

```
ESPECIALISTA_ 
Se registra como profesional de la clinica, y debe ser aceptado para atender en la misma.
Una vez dentro del sistema, puede configurar el tiempo de sus turnos y agregar especialidades de ser necesario.

```

```
USUARIO_ 
Se registra en el sistema con dos imagenes, puede reservar turnos eligiendo el profesional o la especialidad.
Luego de esto, puede ser atendido, y responder un cuestionario sobre la atencion recibida.

```

### Ingreso 🏥

![mi imagen](https://imgur.com/tSBMYtH)

### Registro ➕

![mi imagen](https://imgur.com/3AfQhLu)

### Registro paciente ➕

![mi imagen](https://imgur.com/IYxvd7K)

### Registro Especialista ➕

![mi imagen](https://imgur.com/CazAcjg)

### Reportes y graficos (pendiente)

### Solicitar Turno ➕ (pendiente)


## Despliegue 📦

_El sistema esta deployado en Vercel, y se deja el link para poder ingresar a el_
```
💥 link al deploy [tomas-diaz-zampella-clinica-online.vercel.app](https://tomas-diaz-zampella-clinica-online.vercel.app/)
```








## Construido con 🛠️

_Angular - Supabase_

Este es un trabajo practico para UTN-FRA, consta de realizar un sistema el cual tenga manejo de usuarios, y permita al usuario reservar turnos, y ser atendido

## Requerimientos de la aplicación 🚀

“La clínica OnLine, especialista en salud, cuenta
actualmente con consultorios (6 en la actualidad),
dos laboratorios (físicos en la clínica), y una sala
de espera general. Está abierta al público de lunes
a viernes en el horario de 8:00 a 19:00, y los
sábados en el horario de 8:00 a 14:00.
Trabajan en ella profesionales de diversas
especialidades, que ocupan los consultorios acorde a su disponibilidad, y reciben en ellos
pacientes con turno para consulta o tratamiento. Dichos turnos son pedidos por la web
seleccionando el profesional o la especialidad .La duración mínima de un turno es 30 minutos.”
pero los profesionales pueden cambiar la duración según su especialidad. un profesional puede
tener más de una especialidad
Estamos necesitando un sistema para que cada uno de los tipos de usuarios realicen las tareas
que se detallan a continuación.



