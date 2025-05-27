
<?php
include 'db_mariadb.php';
// include 'db_postgresql.php'; // En el caso que se quiera utilizar postgresql

// Conectar a la base de datos
$mysqli = connectMariaDB();
// $conn = connectPostgreSQL();

// Obtención de información del cv
$cv_info = getCVInfoMariaDB($mysqli);
// $cv_info = getCVInfoPostgreSQL($conn);

// Cierre de conexión
$mysqli->close();
// pg_close($conn);


?>

<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Currículum Vitae Profesional - <?php echo htmlspecialchars($cv_info['name']); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css" type="text/css">
    <link rel="icon" type="image/x-icon" href="https://static-00.iconduck.com/assets.00/f-letter-icon-2048x2048-1jnqbk05.png">
</head>
<body>
    <div class="theme-switch">
        <button onclick="setTheme('light')" id="lightBtn">
            <i class="fas fa-sun"></i>
        </button>
        <button onclick="setTheme('dark')" id="darkBtn">
            <i class="fas fa-moon"></i>
        </button>
    </div>

    <div class="container py-5">
        <?php if ($cv_info): ?>
            <!-- Encabezado del CV -->
           <div class="cv-header mb-4">
		   <div class="row align-items-center">
		        <div class="col-md-3 text-center text-md-start">
		            <img src="https://avatars.githubusercontent.com/u/153614556?v=4" 
		                 alt="Foto de perfil" 
		                 class="profile-image">
		        </div>
		        <div class="col-md-6 text-center text-md-start mt-3 mt-md-0">
		            <h1 class="name-title mb-2"><?php echo htmlspecialchars($cv_info['name']); ?></h1>
		            <h2 class="profession-title"><?php echo htmlspecialchars($cv_info['profession']); ?></h2>
		        </div>
		        <div class="col-md-3 text-center text-md-end mt-3 mt-md-0">
		            <div class="social-links">
		                <a href="mailto:<?php echo htmlspecialchars($cv_info['email']); ?>" class="social-link">
		                    <i class="fas fa-envelope"></i>
		                </a>
		                <a href="<?php echo htmlspecialchars($cv_info['github'] ?? 'https://github.com/FacuPVe'); ?>" class="social-link" target="_blank">
		                    <i class="fab fa-github"></i>
		                </a>
		                <a href="<?php echo htmlspecialchars($cv_info['linkedin'] ?? 'https://www.linkedin.com/in/facundo-epv/'); ?>" class="social-link" target="_blank">
		                    <i class="fab fa-linkedin"></i>
		                </a>
		            </div>
		        </div>
		    </div>
		</div>

            <!-- Experiencia -->
            <div class="card section-card">
                <div class="card-body">
                    <h3 class="section-title">
                        <i class="fas fa-briefcase me-2"></i>Experiencia
                    </h3>
                    <?php 
                    $experiences = explode("\n\n", $cv_info['experience']);
                    foreach ($experiences as $experience): 
                        if (trim($experience)): 
                    ?>
                        <div class="mb-4 p-3 project-card">
                            <?php echo nl2br(htmlspecialchars($experience)); ?>
                        </div>
                    <?php 
                        endif;
                    endforeach; 
                    ?>
                </div>
            </div>
	    
	    
            <!-- Habilidades -->
            <div class="card section-card">
                <div class="card-body">
                    <h3 class="section-title">
                        <i class="fas fa-tools me-2"></i>Conocimientos
                    </h3>
                    <div class="skills-container">
                        <?php 
                        $skills = explode(",", $cv_info['skills'] ?? 'Python,Javascript,PHP,JAVA,HTML,CSS,MySQL,TailwindCSS,Bootstrap,Postman,Visual Studio Code,Visual Studio,Jira');
                        foreach ($skills as $skill): 
                        ?>
                            <span class="skill-badge"><?php echo htmlspecialchars(trim($skill)); ?></span>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- Proyectos -->
            <div class="card section-card">
                <div class="card-body">
                    <h3 class="section-title">
                        <i class="fas fa-code-branch me-2"></i>Proyectos
                    </h3>
                    <?php 
                    $projects = $cv_info['projects'] ?? [
                        ['name' => 'Aerith Game', 'description' => 'Proyecto hecho en java para trabajar con clases abstractas, interfaces y herencia.', 'github' => 'https://github.com/FacuPVe/Aerith-Game', 'tags' => ['Java']],
                        ['name' => 'SoundVibes', 'description' => 'Sistema de Gestión de Usuarios y Recomendaciones Musicales hecho con PHP, JavaScript y TailwindCSS.', 'github' => 'https://github.com/FacuPVe/SoundVibes-Final', 'tags' => ['PHP', 'JavaScript', 'Canvas', 'Howlerjs', 'TailwindCSS', 'CRUD']]
                    ];
                    
                    foreach ($projects as $project): ?>
                        <div class="project-card">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h4 class="mb-0"><?php echo htmlspecialchars($project['name']); ?></h4>
                                <a href="<?php echo htmlspecialchars($project['github']); ?>" 
                                   class="github-btn"
                                   target="_blank">
                                    <i class="fab fa-github me-1"></i> Ver código
                                </a>
                            </div>
                            <p class="mb-3"><?php echo htmlspecialchars($project['description']); ?></p>
                            <div>
                                <?php foreach ($project['tags'] as $tag): ?>
                                    <span class="project-badge">
                                        <?php echo htmlspecialchars($tag); ?>
                                    </span>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>


        <?php else: ?>
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No se encontraron datos del CV.
            </div>
        <?php endif; ?>
    </div>

    <!-- Footer -->
	<footer class="footer mt-5 py-4">
	    <div class="container">
	        <div class="row">
	            <div class="col-md-6">
	                <p class="copyright">
	                    © <?php echo date('Y'); ?> <?php echo htmlspecialchars($cv_info['name']); ?>
	                    <br>
	                    Todos los derechos reservados
	                </p>
	            </div>
	            <div class="col-md-6 text-center">
	                <div class="footer-links">
	                    <a href="mailto:<?php echo htmlspecialchars($cv_info['email']); ?>" class="footer-link">
	                        <i class="fas fa-envelope me-2"></i>Email
	                    </a>
	                    <a href="<?php echo htmlspecialchars($cv_info['github'] ?? 'https://github.com/FacuPVe'); ?>" class="footer-link" target="_blank">
	                        <i class="fab fa-github me-2"></i>GitHub
	                    </a>
	                    <a href="<?php echo htmlspecialchars($cv_info['linkedin'] ?? 'https://www.linkedin.com/in/facundo-epv/'); ?>" class="footer-link" target="_blank">
	                        <i class="fab fa-linkedin me-2"></i>LinkedIn
	                    </a>
	                </div>
	            </div>
	        </div>
	    </div>
	</footer>



    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/script.js"></script>
</body>
</html>
