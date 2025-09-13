<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\IsTrue;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nom', TextType::class, [
                'attr' => [
                    'placeholder' => "Nom"
                ],
                'label' => 'Nom',
                'constraints' => [
                    new NotBlank([
                        'message' => 'Un nom doit être renseigné.',
                    ]),
                ],
            ])
            ->add('prenom', TextType::class, [
                'attr' => [
                    'placeholder' => "Prenom"
                ],
                'label' => 'Prenom',
                'constraints' => [
                    new NotBlank([
                        'message' => 'Un prénom doit être renseigné.',
                    ]),
                ],
            ])
            ->add('email', EmailType::class, [
                'attr' => [
                    'placeholder' => "Adresse email"
                ],
                'label' => 'Email'
            ])
            ->add('agreeTerms', CheckboxType::class, [
                'attr' => [
                    'hidden' => 'true'
                ],
                'mapped' => false,
                'constraints' => [
                    new IsTrue([
                        'message' => 'Tu dois accepter les conditions d\'utilisations.',
                    ]),
                ],
            ])
            ->add('password', RepeatedType::class, [
                'type' => PasswordType::class,
                'invalid_message' => 'Les mots de passes doivent correspondrent.',
                'options' => [
                    'attr' => [
                        'class' => 'password-field'
                ]],
                'required' => true,
                'first_options'  => [
                    'label' => 'Mot de passe',
                    'attr' => [
                        'placeholder' => '********',
                    ],
                    'constraints' => [
                        new NotBlank([
                            'message' => 'Merci de renseigner un mot de passe.',
                        ]),
                        new Length([
                            'min' => 8,
                            'minMessage' => 'Le mot de passe doit contenir au moins {{ limit }} caractères.',
                            // max length allowed by Symfony for security reasons
                            'max' => 4096,
                        ]),
                        new Regex( [
                            'pattern'=> "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/",
                            'message' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'
                        ])
                    ],
                ],
                'second_options' => [
                    'label' => 'Confirmation du mot de passe',
                    'attr' => [
                        'placeholder' => '********',
                    ],
                ],
            ])
            // a decommenter apres
            // ->add("recaptcha", ReCaptchaType::class);


            // ->add('plainPassword', PasswordType::class, [
            //     // instead of being set onto the object directly,
            //     // this is read and encoded in the controller
            //     'mapped' => false,
            //     'attr' => ['autocomplete' => 'new-password'],
            //     'constraints' => [
            //         new NotBlank([
            //             'message' => 'Please enter a password',
            //         ]),
            //         new Length([
            //             'min' => 6,
            //             'minMessage' => 'Your password should be at least {{ limit }} characters',
            //             // max length allowed by Symfony for security reasons
            //             'max' => 4096,
            //         ]),
            //     ],
            // ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'csrf_protection' => true,
            'csrf_field_name' => "_token",
            'csrf_token_id' => 'register'
        ]);
    }
}
