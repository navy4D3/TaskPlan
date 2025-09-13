<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

final class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(AuthenticationUtils $authenticationUtils, Security $security, $loginError = null, $defaultLogin = False): Response
    {
        // if ($security->getUser()) {
        //     return $this->redirectToRoute('profil');
        // }

        // if ($defaultLogin) {
        //     return $this->redirectToRoute('app_home', [
        //         'defaultLogin' => true,
        //     ]);
        // }

        $lastUsername = $authenticationUtils->getLastUsername();

        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);

        return $this->render('home/index.html.twig', [

            'controller_name' => 'HomeController',
            'last_username' => $lastUsername,
            'registrationForm' => $form,
            'error' => $loginError
        ]);
    }
}
