
(function ($) {
	// console.log('inicializado jquery !!!');

	const taxaJuros = 0.017; // 1.7%;
	const taxaJurosPortabilidade = 0.0149; //1.4%
	let tipoEmprestimoSelected, tipoEmprestimo, tipoSimulacao, valorParcela, valorTotal, valorEmprestimo, valorDesejado, qtdParcelas, parcelasDesejada, saldoDevedor, nomeCompleto, dataNascimento, criterioAposentadoria, motivo, cpf, celular, email;

	const scrollTop = function () {
		let top = 300;
		if($('#infographic',parent.document))
			top = $('#infographic',parent.document).offset().top;
		window.parent.parent.scrollTo(0,top-40);
	}

	const inputErrorHandlers = function () {
		$("input[type=text], input[type=tel]").change(function () {
			$(this).removeClass("error-input")
		});
	}

	//HANDLERs...
	const aberturaHandlers = function () {

		$('#saldo-devedor').keyup(function () {
			if ($(this).val() != 'R$ 0,00')
				$('#bnt-iniciar-simulacao').prop('disabled', false);
			else
				$('#bnt-iniciar-simulacao').prop('disabled', true);
		});

		//Botao Iniciar...
		$('#bnt-iniciar-simulacao').click(function () {
			startSimulation();
		});
		//CSS selecao de botoes...
		$('.buttom-box').click(function () {
			const group = $(this).attr("group");
			if (group) {
				$('button[group=' + group + ']').removeClass("active");
				$(this).addClass("active");
			}
		});
		//Botoes Tipo Emprestimo..
		$('button[group=grupoTipoEmprestimo]').click(function () {
			tipoEmprestimo = $(this).attr("tipoEmprestimo");
			portabilidade(tipoEmprestimo);
		});
		//Botao Tipo Simulacao..
		$('button[group=grupoTipoSimulacao]').click(function () {
			tipoSimulacao = $(this).attr("tipoSimulacao");
			$('#bnt-emprestimo-novo').addClass("active");
			mostraSugestoes(tipoSimulacao);
			mostraOutroValor($(this));
		});
		//Botao Sugestoes..
		$('button[group=grupoSugestoes]').click(function () {
			selecionaSugestao($(this));
			mostraOutroValor($(this));
		});
		//Botao Qtd de Parcelas..
		$('.box-qtd-parcela').click(function () {
			selecionaQtdParcelas($(this));
		});


	};

	const obtemCPF = function () {
		cpf = $('#cpf').val();
	};

	const obtemCelular = function () {
		celular = $('#celular').val();
	};

	const obtemEmail = function () {
		email = $('#email').val();
	};

	const isCheckedTermoPolitica = function () {
		return $('#termoPolitica:checked').length > 0;
	}

	const habilitaBotaoResultado = function () {
		obtemCPF();
		obtemCelular();
		obtemEmail();
		if (cpf != "" && cpf.length == 14 && celular != "" && email != "" && isCheckedTermoPolitica())
			$('#ver-resultado').prop('disabled', false);
		else
			$('#ver-resultado').prop('disabled', true);
	};

	const habilitaBotao = function () {
		obtemCriterioAposentadoria();
		obtemMotivo();
		const nome = $('.txt-nome-completo').val();
		const dtNasc = $('.txt-data-nasc').val();
		if (nome != "" && dtNasc != "" && dtNasc.length == 10 && criterioAposentadoria != undefined && motivo != undefined)
			$('.bnt-avancar-step2').prop('disabled', false);
		else
			$('.bnt-avancar-step2').prop('disabled', true);
	}

	const step1Handlers = function () {
		$('.btn-motivo-emprestimo').click(function () {
			selecionaMotivoEmprestimo($(this));
		});

		$('.btn-criterio-aposentadoria').click(function () {
			selecionaCriterioAposentadoria($(this));
		});

		$('.txt-nome-completo, .txt-data-nasc, .btn-criterio-aposentadoria, .btn-motivo-emprestimo').change(habilitaBotao);
		$('.txt-nome-completo, .txt-data-nasc').keyup(habilitaBotao);
		$('.btn-criterio-aposentadoria, .btn-motivo-emprestimo').click(habilitaBotao);
		$(".social-share").click(function(){let e=$(this).data("href");window.open(e,"shareWindow","height=450, width=550, top="+($(window).height()/2-275)+", left="+($(window).width()/2-225)+", toolbar=0, location=0, menubar=0, directories=0, scrollbars=0")});
	};

	const resultHandlers = function () {
		$('#cpf, #celular, #email').keyup(habilitaBotaoResultado);
		$('#termoPolitica').click(habilitaBotaoResultado);
		$('#ver-resultado').click(function () {
			showResult();
		})
	};

	const registraHandlers = function () {

		aberturaHandlers();
		step1Handlers();
		resultHandlers();

		$('.bnt-avancar-step2').click(function () {
			step_2();
		});

		$('.bnt-voltar').click(function () {
			againSimulation();
		});

		$('.bnt-avancar').click(function () {

			let valorParcelas = $('#valor-parcelas');
			valorParcelas.removeClass('error-input');

			if (valorParcelas.val() == '') {
				valorParcelas.addClass('error-input');
				$('#step-2-parcela-error').html('Por favor, informe o valor da parcela');
				return false;
			} else {
				showModal();
			}
		});

		$('#modal-voltar').click(function () {
			closeModal();
		});

		$('.bnt-simular-novamente').click(function () {
			againSimulation();
		});

		$('.bnt-avancar-valor').click(function () {

			let valorEmprestimo = $('#valor-emprestimo');
			valorEmprestimo.removeClass('error-input');

			if (valorEmprestimo.val() == '') {
				valorEmprestimo.addClass('error-input');
				$('#step-2-valor-error').html('Por favor, informe o valor do emprestimo');
				return false;
			} else {
				showModal();
			}
		});



		$("#modal-voltar-termo-politica").click(function () {
			$("#modal-error").html("");
			$('#txt-termo-politica').hide();
			$('#txt-termo-politica').css("display", "none");
			$("#h1-quase-la").fadeIn();
			$("#txt-preenhca-quase-la").fadeIn();
			$(".form-restricted-area").fadeIn();
			$(".btn-quase-la").fadeIn();
		});

		inputErrorHandlers();
	};

	//MASKs...
	const registraMascaras = function () {
		$('#valor-desejado-parcela, #valor-desejado-total, #saldo-devedor').maskMoney({ prefix: 'R$ ', allowNegative: true, thousands: '.', decimal: ',', affixesStay: false });
		$('#data-nascimento').mask("99/99/9999", { selectOnFocus: true, placeholder: "dd/mm/aaaa" });
		$('#cpf').mask("999.999.999-99", { selectOnFocus: true });

		$('#valor-emprestimo').maskMoney({ prefix: 'R$ ', allowNegative: true, thousands: '.', decimal: ',', affixesStay: false });
		// $('#resultado-valor-total-input').maskMoney({ prefix: 'R$ ', thousands: '.', decimal: ',', affixesStay: true });
		$("#celular").mask("(00) 0000-00009");
	};

	const againSimulation = function () {

		$('#step_err').hide();
		$('#simulatorParams').hide();
		$('#step_01').hide();
		$('#step_2_valor').hide();
		$('#step_2_parcela').hide();
		$('#step_3').hide();
		$('#step_0').fadeIn();
		// scrollTop();
	};

	//Tela inicial...
	const resetTipoSimulacao = function () {
		$('button[group=grupoTipoSimulacao]').removeClass("active");
	};

	//Sugestoes
	const resetSugestoes = function () {
		$('button[group=grupoSugestoes]').removeClass("active");
	};

	const portabilidade = function (tipo) {
		resetSugestoes();
		$('#bnt-emprestimo-novo').removeClass("active");
		if (tipo == 'portabilidade') {
			$('#novo-emprestimo').hide();
			$('#linhaTipoSimulacao').hide();
			$('#bnt-emprestimo-novo').removeClass("active");
			$('#portabilidade-emprestimo').fadeIn();
			$('#txt-portabilidade').fadeIn();
			if ($('#saldo-devedor').val() != '')
				$('#bnt-iniciar-simulacao').prop('disabled', false);
			else
				$('#bnt-iniciar-simulacao').prop('disabled', true);
		} else {
			$('#bnt-emprestimo-novo').addClass("active");
			$('#linhaSugestoes').hide();
			resetTipoSimulacao();
			$('#portabilidade-emprestimo').hide();
			$('#txt-portabilidade').hide();
			$('#linhaTipoSimulacao').fadeIn();
			$('#novo-emprestimo').fadeIn();
			$("#bnt-iniciar-simulacao").prop('disabled', true);
		}

		$("#step-0-error").html("");
	};

	const selecionaQtdParcelas = function (element) {
		$('.box-qtd-parcela').removeClass('active');
		element.addClass("active");
	}

	const selecionaSugestao = function (element) {
		$("#step-0-error").html("");
		$('button[group=grupoSugestoes]').removeClass("active");
		element.addClass("active");
		$('#bnt-iniciar-simulacao').prop('disabled', false);
	}

	const mostraSugestoes = function (pTipoSimulacao) {
		resetSugestoes();
		$('#linhaSugestoes').fadeIn();
		if (pTipoSimulacao == "total") {
			$("#sugestoesParcela").hide();
			$("#sugestoesValor").fadeIn();
		} else
			if (pTipoSimulacao == "parcela") {
				$("#sugestoesValor").hide();
				$("#sugestoesParcela").fadeIn();
			}
		$("#step-0-error").html("");
	};

	const mostraFormOutroValor = function () {
		if (tipoSimulacao == "parcela" || tipoSimulacao == undefined) {
			$('#formOutroValor-total').hide();
			$('#formOutroValor-parcela').fadeIn();
		} else if (tipoSimulacao == "total") {
			$('#formOutroValor-parcela').hide();
			$('#formOutroValor-total').fadeIn();
		}
	};

	const mostraOutroValor = function (element) {
		if (!element.hasClass("outroValor")) {
			$('#formOutroValor-parcela').hide();
			$('#formOutroValor-total').hide();
		} else
			mostraFormOutroValor();
		$("#step-0-error").html("");
	};

	const showModal = function () {
		console.log(criterioAposentadoria);
		if (criterioAposentadoria != 'Não') {
			$('#modal-quase-la').fadeIn();
			$('#modal-error').html('');
		} else {
			$('#content-step1').hide();
			$('#content-step1-no-retired').fadeIn();
		}
	};

	const closeModal = function () {
		$('#modal-quase-la').hide();
	};

	const obtemTipoEmprestimo = function () {
		$('button[group=grupoTipoEmprestimo]').each(function () {
			if ($(this).hasClass("active") && $(this).attr("tipoEmprestimo")) {
				tipoEmprestimo = $(this).attr("tipoEmprestimo");
				tipoEmprestimoSelected = $(this).attr("tipoEmprestimo");
			}
		});
	};

	const obtemTipoSimulacao = function () {
		$('button[group=grupoTipoSimulacao]').each(function () {
			if ($(this).hasClass("active") && $(this).attr("tipoSimulacao"))
				tipoSimulacao = $(this).attr("tipoSimulacao");
		});
	}

	const obtemValorParcela = function () {
		$('button[group=grupoSugestoes]').each(function () {
			if ($(this).hasClass("active") && $(this).attr("parcela"))
				valorParcela = parseFloat($(this).attr("parcela"));
		});
	};

	const obtemValorTotal = function () {
		$('button[group=grupoSugestoes]').each(function () {
			if ($(this).hasClass("active") && $(this).attr("valorTotal"))
				valorTotal = parseFloat($(this).attr("valorTotal"));
		});
	};

	const obtemValorDesejado = function () {
		if (tipoSimulacao == "parcela")
			valorDesejado = parseFloat($('#valor-desejado-parcela').maskMoney('unmasked')[0]);
		else if (tipoSimulacao == "total")
			valorDesejado = parseFloat($('#valor-desejado-total').maskMoney('unmasked')[0]);
	};

	const obtemParcelasDesejada = function () {
		qtdParcelas = 72;
		if (tipoEmprestimo == "novo")
			if (tipoSimulacao == "parcela" && valorParcela == 0)
				$('.bnt-simulador-parcela-qtd-parcela').each(function () {
					if ($(this).hasClass("active"))
						qtdParcelas = $(this).attr("qtd-parcela");
				});
			else if (tipoSimulacao == "total" && valorTotal == 0)
				$('.bnt-simulador-total-qtd-parcela').each(function () {
					if ($(this).hasClass("active"))
						qtdParcelas = $(this).attr("qtd-parcela");
				});
	};

	const obtemSaldoDevedor = function () {
		saldoDevedor = parseFloat($('#saldo-devedor').maskMoney('unmasked')[0]);
	};

	const textoValorSelecionadoParam = function () {



		let valorParam, centavosParam = 0.0;
		if (tipoEmprestimo == 'novo') {
			if (tipoSimulacao == "parcela")
				if (valorParcela != 0)
					valorParam = valorParcela;
				else
					valorParam = valorDesejado
			else
				if (tipoSimulacao == "total")
					if (valorTotal != 0)
						valorParam = valorTotal;
					else
						valorParam = valorDesejado;
		}

		if (tipoEmprestimo == 'portabilidade')
			valorParam = saldoDevedor;

		let textoValor;
		if (tipoSimulacao == "parcela") {
			textoValor = (valorParam | 0) + ",";
			return qtdParcelas + "x de R$ " + textoValor + (valorParam - (valorParam | 0)).toFixed(2).replace('0.', '');
		}
		else
			return (valorParam / 1000) + " MIL";

	};

	const resetParamsSimulacao = function () {
		$('#params-novo').hide();
		$('#params-portabilidade').hide();
		$('#simulatorParams').hide();
		$('param-tipo-emprestimo').html("");
		$('param-tipo-simulacao').html("");
		$('param-parcelas').html("");
		$('param-valor-total').html("");
	};

	const mostraParamsSimulacao = function () {

		resetParamsSimulacao();

		$('#simulatorParams').fadeIn();
		switch (tipoEmprestimo) {
			case "novo":
				$('#params-novo').fadeIn();
				$('#param-tipo-emprestimo').html("Novo Empréstimo");
				$('#dadosNovoEmprestimo').fadeIn();
				switch (tipoSimulacao) {
					case "parcela":
						$('#param-tipo-simulacao').html("Valor das parcelas");
						break;
					case "total":
						$('#param-tipo-simulacao').html("Valor total");
						break;
				}
				$('#param-valor-total').html(textoValorSelecionadoParam());
				break;
			case "portabilidade":
				$('#params-portabilidade').fadeIn();
				$('#param-tipo-emprestimo').html("Portabilidade");
				$('#dadosNovoEmprestimo').hide();
				break;
		};

	};

	const validaStart = function () {
		$('#step-0-error').html('');
		if (tipoEmprestimo == undefined || tipoEmprestimo == "") {
			$('#step-0-error').html('Por favor, selecione o tipo do seu empréstimo.');
			return false;
		} else
			//Novo..
			if (tipoEmprestimo == "novo") {
				if (tipoSimulacao == undefined || tipoSimulacao == "") {
					$('#step-0-error').html('Por favor, selecione como você quer simular.');
					return false;
				}
				if (tipoSimulacao == "total" && valorTotal == undefined) {
					$('#step-0-error').html('Por favor, selecione valor desejado ou simule outro.');
					return false;
				} else
					if (tipoSimulacao == "parcela" && valorParcela == undefined) {
						$('#step-0-error').html('Por favor, selecione parcela desejada ou simule outro valor.');
						return false;
					} else
						if (
							((tipoSimulacao == "parcela" && valorParcela == 0) || (tipoSimulacao == "total" && valorTotal == 0))
							&& (!$.isNumeric(valorDesejado) || valorDesejado <= 0)
						) {
							$('.valor-desejado').addClass('error-input');
							$('#step-0-error').html('Por favor, preencha o campo Valor Desejado.');
							return false;
						}
			} else
				//Portabilidade...
				if (tipoEmprestimo == "portabilidade" && (saldoDevedor <= 0 || !$.isNumeric(saldoDevedor))) {
					$('#saldo-devedor').addClass('error-input');
					$('#step-0-error').html('Por favor, preencha o campo Saldo Devedor');
					return false;
				}

		return true;
	};

	const mostraMotivos = function () {
		$('#motivos-novo').css("display", "none !important");
		$('#motivos-novo').hide();
		$('#motivos-portabilidade').css("display", "none !important");
		$('#motivos-portabilidade').hide();
		if (tipoEmprestimo == "novo")
			$('#motivos-novo').show();
		else if (tipoEmprestimo == "portabilidade") {
			$('#motivos-portabilidade').show();

		}
	};

	const startSimulation = function () {

		obtemTipoEmprestimo();
		obtemTipoSimulacao();
		obtemValorParcela();
		obtemValorTotal();
		obtemSaldoDevedor();
		obtemValorDesejado();
		obtemParcelasDesejada();
		if (validaStart()) {
			$('#step_0').hide();
			$('#step_01').fadeIn();
			mostraParamsSimulacao();
			mostraMotivos();
			scrollTop();
		}

		// parent.location.hash = '#lead1';
	};

	const selecionaMotivoEmprestimo = function (element) {
		$('.btn-motivo-emprestimo').removeClass('active');
		element.addClass("active");
	};

	const selecionaCriterioAposentadoria = function (element) {
		$('.btn-criterio-aposentadoria').removeClass('active');
		element.addClass("active");
	};

	const obtemMotivo = function () {
		$('.btn-motivo-emprestimo').each(function () {
			if ($(this).hasClass("active"))
				motivo = $(this).attr("motivo");
		})
	};

	const obtemCriterioAposentadoria = function () {
		$('.btn-criterio-aposentadoria').each(function () {
			if ($(this).hasClass("active"))
				criterioAposentadoria = $(this).attr("criterio");
		})
	};

	const validaStep2 = function () {

		limpaErrosStep2();
		$('#step-1-error').html('');

		const nome = $('#nome-completo');
		nomeCompleto = nome.val();

		if (nomeCompleto == '' || !isNomeCompletoValido(nomeCompleto)) {
			nome.addClass('error-input')
			$('#step-1-error').html('Por favor, preencha Nome Completo');
			return false;
		}

		const objDtNasc = $('#data-nascimento');
		dataNascimento = objDtNasc.val();
		if (dataNascimento == '') {
			objDtNasc.addClass('error-input');
			$('#step-1-error').html('Por favor, preencha Data Nascimento');
			return false;
		}

		if (criterioAposentadoria == undefined || criterioAposentadoria == "") {
			$('#step-1-error').html('Por favor, selecione Critério de Aposentadoria');
			return false;
		}

		if (motivo == undefined || motivo == "") {
			$('#step-1-error').html('Por favor, selecione o Motivo');
			return false;
		}


		return true;
	};

	const limpaErrosStep2 = function () {
		$('#step-1-error').html("");
		$('#step-err-born-date').hide();
	};

	const isAposentado = function(){
		return criterioAposentadoria == 'INSS';
	}

	const step_2 = function () {
		obtemMotivo();
		obtemCriterioAposentadoria();
		if (validaStep2()) {
			if(isAposentado()){
				if (validateSimulator()) {
					limpaErrosStep2();
					$('#modal-quase-la').fadeIn();
				} else {
					$('#data-nascimento').addClass('error-input');
					$('#step-err-born-date').fadeIn();
				}
				// parent.location.hash = '#lead2';
			} else {
				$('#content-step1').hide();
				$('#content-step1-no-retired').fadeIn();
			}
		}
		scrollTop();
	}

	function idade(ano_aniversario, mes_aniversario, dia_aniversario) {
		var d = new Date,
			ano_atual = d.getFullYear(),
			mes_atual = d.getMonth() + 1,
			dia_atual = d.getDate(),


			ano_aniversario = +ano_aniversario,
			mes_aniversario = +mes_aniversario,
			dia_aniversario = +dia_aniversario,

			quantos_anos = ano_atual - ano_aniversario;

		if (mes_atual < mes_aniversario || mes_atual == mes_aniversario && dia_atual < dia_aniversario) {
			quantos_anos--;
		}

		return quantos_anos < 0 ? 0 : quantos_anos;
	}

	const validateSimulator = function () {

		const data_nasc = $('#data-nascimento').val();
		const arrDate = data_nasc.split('/');
		const date = new Date(arrDate[2] + '-' + arrDate[1] + '-' + arrDate[0]);

		if (date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date)) {
			const i = idade(arrDate[2], arrDate[1], arrDate[0]);
			if (i < 18 || i > 80) {
				return false;
			}
		} else {
			return false;
		}
		return true;
	};

	const calculaValorEmprestimo = function () {

		let vlr = 0;
		if (tipoEmprestimo == "novo")
			if (valorParcela > 0)
				vlr = parseFloat(valorParcela);
			else
				vlr = parseFloat(valorDesejado);
		else
			if (tipoEmprestimo == "portabilidade")
				vlr = parseFloat(saldoDevedor);

		const taxaJurosSelecionada = tipoEmprestimo == "novo" ? taxaJuros : taxaJurosPortabilidade;
		valorEmprestimo = parseFloat(vlr / (taxaJurosSelecionada / (1 - (1 / (Math.pow((1 + taxaJurosSelecionada), qtdParcelas))))));
		valorParcela = vlr;
		mostraCalculoEmprestimo(valorEmprestimo, vlr, qtdParcelas);
	};

	const calculaParcela = function () {

		if (tipoEmprestimo == "novo")
			if (valorTotal > 0)
				valorEmprestimo = parseFloat(valorTotal);
			else
				valorEmprestimo = parseFloat(valorDesejado);
		else
			if (tipoEmprestimo == "portabilidade") {
				valorEmprestimo = parseFloat(saldoDevedor);
			}

		const taxaJurosSelecionada = tipoEmprestimo == "novo" ? taxaJuros : taxaJurosPortabilidade;
		valorParcela = parseFloat(valorEmprestimo * (taxaJurosSelecionada / (1 - (1 / (Math.pow((1 + taxaJurosSelecionada), qtdParcelas))))));

		mostraCalculoEmprestimo(valorEmprestimo, valorParcela, qtdParcelas);
	};

	const mostraCalculoEmprestimo = function (valorTotalCalculado, valorParcelaCalculado, qtdParcelas) {
		//$('#resultado-valor-total').maskMoney({ prefix: 'R$ ', allowNegative: true, thousands: '.', decimal: ',', affixesStay: false });
		$('#resultado-valor-total').html('R$ ' + numeroParaMoeda(valorTotalCalculado));
		$('#resultado-valor-parcela').html('R$ ' + numeroParaMoeda(valorParcelaCalculado));
		$('#resultado-qtd-parcelas').html(qtdParcelas + ' parcelas');
		closeModal();
		$('#step_01').hide();
		$('#step_3').fadeIn();
		scrollTop();
	}

	againSimulation();
	registraMascaras();
	registraHandlers();






	function numeroParaMoeda(n, c, d, t) {
		c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	}

	function isEmail(email) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	}


	function TestaCPF(strCPF) {
		strCPF = strCPF.replace('.', '').replace('.', '').replace('-', '');
		var Soma;
		var Resto;
		Soma = 0;
		switch (strCPF) {
			case "00000000000":
			case "11111111111":
			case "22222222222":
			case "33333333333":
			case "44444444444":
			case "55555555555":
			case "66666666666":
			case "77777777777":
			case "88888888888":
			case "99999999999":
				return false;
		}

		for (i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
		Resto = (Soma * 10) % 11;

		if ((Resto == 10) || (Resto == 11)) Resto = 0;
		if (Resto != parseInt(strCPF.substring(9, 10))) return false;

		Soma = 0;
		for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
		Resto = (Soma * 10) % 11;

		if ((Resto == 10) || (Resto == 11)) Resto = 0;
		if (Resto != parseInt(strCPF.substring(10, 11))) return false;
		return true;
	}


	let showResult = function () {

		let cpf = $('#cpf');
		let celular = $('#celular');
		let email = $('#email');
		let vFields = true;


		cpf.removeClass('error-input');
		celular.removeClass('error-input');
		email.removeClass('error-input');

		if (cpf.val() == '') {
			cpf.addClass('error-input');
			$('#modal-error').html('Por favor, preencha o campo CPF.');
			return false;
		}

		if (TestaCPF(cpf.val().replace('.', '').replace('.', '').replace('-', '')) === false) {
			cpf.addClass('error-input');
			$('#modal-error').html('Por favor, informe um CPF válido.');
			return false;
		}


		if (celular.val() == '') {
			celular.addClass('error-input');
			$('#modal-error').html('Por favor, preencha o campo Celular.');
			return false;
		}

		if (email.val() == '') {
			email.addClass('error-input');
			$('#modal-error').html('Por favor, preencha o campo E-mail.');
			return false;
		} else

			if (!isEmail(email.val())) {
				email.addClass('error-input');
				$('#modal-error').html('Por favor, favor informar E-mail válido.');
				return false;
			}

		if (!$("#termoPolitica").is(':checked')) {
			$('#modal-error').html('Por favor, para prosseguir é necessário aceitar Termos de Uso e Política de Privacidade.');
			return false;
		}

		// if ($('#bnt-simulador-parcela').hasClass('active')) {
		if (tipoEmprestimo == "novo" && tipoSimulacao == "parcela") {
			calculaValorEmprestimo();
			submitLead();
		}

		// if ($('#bnt-simulador-valor').hasClass('active')) {
		if ((tipoEmprestimo == "novo" && tipoSimulacao == "total")
			|| tipoEmprestimo == "portabilidade") {
			calculaParcela();
			submitLead();
		}
		scrollTop();
		// parent.location.hash = '#resultado';
	}

	const openWhatsappChat = function () {
		location.href = "https://wa.me/+5521999619936?text=Mensagem Teste para Leonardo";
	}

	const sendInterestedWhatsapp = function () {
		submitLeadWhatsapp();
	};

	$('#talk-to-specialist').click(function () {
		sendInterestedWhatsapp();
		// openWhatsappChat();
	});

	$('#valor-parcelas').change(function () {
		$(this).removeClass('error-input');
		$('#step-2-parcela-error').html('');
	});

	$('#valor-emprestimo').change(function () {
		$(this).removeClass('error-input');
		$('#step-2-valor-error').html('');
	});

	$('.modal-form-fields').change(function () {
		if ($('#cpf').val() != '' && $('#celular').val() != '' && $('#email').val() != '') {
			$('#modal-error').html('');
		}
	});

	const prepareLeadData = function () {
		const hookType = 'simulator_loan';
		const cpf = $('#cpf').val();
		const celular = $('#celular').val();
		const email = $('#email').val();
		const interest = tipoEmprestimoSelected == "novo" ? taxaJuros : taxaJurosPortabilidade;
		const loan_type = tipoEmprestimoSelected;
		const simlation_type = tipoEmprestimoSelected == "novo" ? tipoSimulacao : "total";

		return {
			name: nomeCompleto,
			loan_type: loan_type,
			simulation_type: simlation_type,
			date_of_birth: dataNascimento,
			interest: interest,
			loan_value: valorEmprestimo,
			loan_quota: valorParcela,
			amount_quota: qtdParcelas,
			retirement_type: criterioAposentadoria,
			reason: motivo,
			cpf: cpf,
			phone: celular,
			email: email,
			hook_type: hookType
		};
	}

	const persistLead = function (params) {

		let domain = document.location.hostname;
		let apiPath = '/api/v1/simulators/create'

		if (domain == 'localhost') {
			domain = 'http://' + domain;
		} else if (domain == 'hmg-instituto-v2.brazilsouth.cloudapp.azure.com') {
			domain = 'http://' + domain + ':8088';
		} else {
			domain = 'https://' + domain;
		}

		let jqxhr = $.post(domain + apiPath, params, function (data) {
			if (data.status == 'success') {
				return true;
			}
		})
			.done(function () {
				//alert( "second success" );
			})
			.fail(function () {
				$('#error_form_lead').html("Falha no envio dados dados.");
				return false;
			})
			.always(function () {
			});
	}

	let submitLead = () => {
		let params = prepareLeadData();
		Object.assign(params, { 'interested_whatsapp': 0 });
		persistLead(params);
	};

	const submitLeadWhatsapp = function () {
		let params = prepareLeadData();
		Object.assign(params, { 'interested_whatsapp': 1 });
		persistLead(params);
	}

	function isNomeValido(nome) {
		return nome.length > 0 && nome.match(/^[a-zA-Z\u00C0-\u017F´]{0,}$/);
	}

	function isNomeCompletoValido(nomeCompleto) {
		const nomes = nomeCompleto.split(" ");
		let isValido = true;
		if (nomes.length < 2)
			isValido = false;
		else
			nomes.forEach(function (n) {
				if (!isNomeValido(n)) {
					isValido = false;
				}
			});

		return isValido;
	}


	
})(jQuery);


function mostraTermoPolitica() {
	$("#modal-error").html("");
	$("#h1-quase-la").hide();
	$("#txt-preenhca-quase-la").hide();
	$(".form-restricted-area").hide();
	$(".btn-quase-la").hide();
	$('#txt-termo-politica').css("display", "block");
	$('#txt-termo-politica').fadeIn();
}